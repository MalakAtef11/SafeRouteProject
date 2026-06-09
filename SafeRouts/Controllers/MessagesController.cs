using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SafeRoutes.Data;
using SafeRoutes.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SafeRoutes.Controllers
{
    [Route("api/v1/[controller]")]
    [ApiController]
    public class MessagesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public MessagesController(AppDbContext context)
        {
            _context = context;
            try
            {
                // Auto-create ChatMessages table if it does not exist
                _context.Database.ExecuteSqlRaw(@"
                    IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='ChatMessages' AND xtype='U')
                    BEGIN
                        CREATE TABLE ChatMessages (
                            MessageID INT IDENTITY(1,1) PRIMARY KEY,
                            SenderID INT NOT NULL FOREIGN KEY REFERENCES Users(UserID),
                            ReceiverID INT NOT NULL FOREIGN KEY REFERENCES Users(UserID),
                            MessageText NVARCHAR(MAX) NOT NULL,
                            SentAt DATETIME NOT NULL DEFAULT GETUTCDATE(),
                            IsRead BIT NOT NULL DEFAULT 0
                        )
                    END
                ");
            }
            catch (Exception ex)
            {
                Console.WriteLine("Error auto-creating ChatMessages table: " + ex.Message);
            }
        }

        // 1. Get Chat History between two users
        [HttpGet("history")]
        public async Task<IActionResult> GetChatHistory([FromQuery] int user1Id, [FromQuery] int user2Id)
        {
            var messages = await _context.ChatMessages
                .Where(m => (m.SenderID == user1Id && m.ReceiverID == user2Id) ||
                            (m.SenderID == user2Id && m.ReceiverID == user1Id))
                .OrderBy(m => m.SentAt)
                .Select(m => new
                {
                    messageId = m.MessageID,
                    senderId = m.SenderID,
                    receiverId = m.ReceiverID,
                    messageText = m.MessageText,
                    sentAt = m.SentAt,
                    isRead = m.IsRead
                })
                .ToListAsync();

            // Mark incoming messages as read
            var unreadMessages = await _context.ChatMessages
                .Where(m => m.SenderID == user2Id && m.ReceiverID == user1Id && !m.IsRead)
                .ToListAsync();

            if (unreadMessages.Any())
            {
                foreach (var msg in unreadMessages)
                {
                    msg.IsRead = true;
                }
                await _context.SaveChangesAsync();
            }

            return Ok(messages);
        }

        // 2. Send Message
        [HttpPost("send")]
        public async Task<IActionResult> SendMessage([FromBody] SendMessageRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.MessageText))
                return BadRequest("Message text cannot be empty.");

            var sender = await _context.Users.FindAsync(request.SenderID);
            var receiver = await _context.Users.FindAsync(request.ReceiverID);

            if (sender == null || receiver == null)
                return BadRequest("Sender or Receiver not found.");

            var message = new ChatMessage
            {
                SenderID = request.SenderID,
                ReceiverID = request.ReceiverID,
                MessageText = request.MessageText,
                SentAt = DateTime.UtcNow,
                IsRead = false
            };

            _context.ChatMessages.Add(message);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                messageId = message.MessageID,
                senderId = message.SenderID,
                receiverId = message.ReceiverID,
                messageText = message.MessageText,
                sentAt = message.SentAt,
                isRead = message.IsRead
            });
        }

        // 3. Get Active Conversations for a user
        [HttpGet("conversations")]
        public async Task<IActionResult> GetConversations([FromQuery] int userId)
        {
            var sentTo = await _context.ChatMessages
                .Where(m => m.SenderID == userId)
                .Select(m => m.ReceiverID)
                .Distinct()
                .ToListAsync();

            var receivedFrom = await _context.ChatMessages
                .Where(m => m.ReceiverID == userId)
                .Select(m => m.SenderID)
                .Distinct()
                .ToListAsync();

            var allUserIds = sentTo.Union(receivedFrom).Distinct().ToList();
            var conversations = new List<object>();

            foreach (var otherId in allUserIds)
            {
                var otherUser = await _context.Users.FirstOrDefaultAsync(u => u.UserID == otherId);
                if (otherUser == null) continue;

                var lastMsg = await _context.ChatMessages
                    .Where(m => (m.SenderID == userId && m.ReceiverID == otherId) ||
                                (m.SenderID == otherId && m.ReceiverID == userId))
                    .OrderByDescending(m => m.SentAt)
                    .FirstOrDefaultAsync();

                if (lastMsg == null) continue;

                conversations.Add(new
                {
                    userId = otherUser.UserID,
                    fullName = otherUser.FullName,
                    email = otherUser.Email,
                    userType = otherUser.UserType,
                    lastMessageText = lastMsg.MessageText,
                    sentAt = lastMsg.SentAt,
                    isUnread = !lastMsg.IsRead && lastMsg.ReceiverID == userId
                });
            }

            // Return conversations sorted by last message time descending
            var sorted = conversations
                .Select(c => (dynamic)c)
                .OrderByDescending(c => c.sentAt)
                .ToList();

            return Ok(sorted);
        }

        // 4. Get Contacts List (Sector users for Citizens)
        [HttpGet("contacts")]
        public async Task<IActionResult> GetContacts()
        {
            var sectorUsers = await _context.Users
                .Where(u => u.UserType == "Sector")
                .Include(u => u.Sector)
                .Select(u => new
                {
                    userId = u.UserID,
                    fullName = u.FullName + " (" + (u.Sector != null ? u.Sector.SectorName : "Sector") + ")",
                    email = u.Email,
                    userType = u.UserType
                })
                .ToListAsync();

            return Ok(sectorUsers);
        }
    }

    public class SendMessageRequest
    {
        public int SenderID { get; set; }
        public int ReceiverID { get; set; }
        public string MessageText { get; set; } = string.Empty;
    }
}
