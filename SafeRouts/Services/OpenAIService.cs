using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using Microsoft.AspNetCore.Http; // تأكدي من وجودها للـ IFormFile

public class OpenAIService
{
    private readonly HttpClient _httpClient;
    private readonly string _apiKey;

    public OpenAIService(IConfiguration config)
    {
        _httpClient = new HttpClient();
        _apiKey = config["OpenAI:ApiKey"] ?? throw new ArgumentNullException("OpenAI ApiKey is missing");
    }

    public const string DefaultSystemPrompt = @"
أنت محرك ذكي لتحليل وتصنيف البلاغات (SafeRoute AI).

🎯 المهمة:
تحليل البلاغ واستخراج القطاعات المعنية ودرجة الخطورة بناءً على الوصف والموقع.

🌍 التعامل مع اللغات (Language Handling):
1. استقبل المدخلات باللغة العربية أو الإنجليزية.
2. إلزامياً: يجب أن يكون الـ (summary) دائماً باللغة العربية.

📌 القطاعات (sectorIds) المتاحة حسب المحافظة والنوع:
- البلديات والمحافظات:
  1: البلدية (عام/مجهول) | 5: أمانة عمان | 6: بلدية إربد | 7: بلدية الزرقاء | 8: بلدية العقبة | 9: بلدية الكرك | 10: بلدية مادبا | 11: بلدية السلط | 12: بلدية جرش | 13: بلدية عجلون | 14: بلدية المفرق | 15: بلدية الطفيلة | 16: بلدية معان
- الخدمات والطوارئ:
  2: إدارة السير | 3: الكهرباء | 4: المياه | 17: طوارئ المياه | 18: طوارئ الكهرباء | 19: الأمن العام | 20: الدفاع المدني.

🧠 قواعد الذكاء في التوجيه (مهم جداً):
1. الحفر والشوارع والنظافة: يجب أن تذهب دائماً لبلدية المحافظة المذكورة في الـ Context (الأرقام 5 إلى 16). ممنوع استخدام 1 إذا كانت المحافظة معروفة.
2. الحوادث المرورية والإصابات: يجب توجيهها إلى (2: إدارة السير) + (20: الدفاع المدني) + (19: الأمن العام).
3. حفرة سببت حادث: يتم التوجيه لـ (بلدية المحافظة) لإصلاح الحفرة + (2) للسير + (20) للدفاع المدني.
4. انقطاع أسلاك أو تماس كهربائي: يتم التوجيه لـ (18: طوارئ الكهرباء) + (20: الدفاع المدني) إذا كان هناك خطر حريق.
5. تسريب مياه ضخم أو فيضان: يتم التوجيه لـ (17: طوارئ المياه) + (بلدية المحافظة) للتعامل مع غرق الشوارع.
يجب عليك إرجاع أكثر من SectorID في قائمة واحدة إذا تطلب الأمر.

⚖️ درجة الخطورة (priorityId):
- 3: طارئ (حريق، حادث، خطر حياة، أسلاك كهرباء مكشوفة).
- 2: متوسط (حفرة كبيرة، إشارة معطلة، تسريب مياه).
- 1: منخفض (نفايات، رصيف مكسور).

📦 الشكل المطلوب (JSON فقط - هذا مجرد مثال، لا تقم بنسخه بل استنتج القيم الحقيقية):
{
  ""sectorIds"": [13, 2],
  ""priorityId"": 3,
  ""summary"": ""(اكتب هنا ملخص البلاغ الحقيقي المستنتج باللغة العربية)"",
  ""confidence"": 0.95,
  ""extractedText"": ""(النص الأصلي هنا)""
}
";

    public string GetSystemPrompt()
    {
        var filePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "ai_prompt.txt");
        if (System.IO.File.Exists(filePath))
        {
            return System.IO.File.ReadAllText(filePath);
        }
        return DefaultSystemPrompt;
    }

    public async Task<AIResult> AnalyzeText(string text, string locationContext = "")
    {
        var requestBody = new
        {
            model = "gpt-4o-mini",
            messages = new object[]
            {
                new { role = "system", content = GetSystemPrompt() },
                new { role = "user", content = $"الموقع (Context): {locationContext}\n\nAnalyze this: {text}" } 
            },
            response_format = new { type = "json_object" }
        };
        return await SendChat(requestBody);
    }

    public async Task<AIResult> AnalyzeImage(IFormFile image, string locationContext = "")
    {
        using var ms = new MemoryStream();
        await image.CopyToAsync(ms);
        var base64 = Convert.ToBase64String(ms.ToArray());
        var requestBody = new
        {
            model = "gpt-4o-mini",
            messages = new object[]
            {
                new { role = "system", content = GetSystemPrompt() },
                new {
                    role = "user",
                    content = new object[]
                    {
                        new { type = "text", text = $"الموقع (Context): {locationContext}\n\nIdentify the issue in this image, determine sectors and priority, and provide the summary in Arabic." },
                        new { type = "image_url", image_url = new { url = $"data:image/jpeg;base64,{base64}" } }
                    }
                }
            },
            response_format = new { type = "json_object" }
        };
        return await SendChat(requestBody);
    }

    public async Task<AIResult> AnalyzeAudio(IFormFile audio, string locationContext = "")
    {
        using var content = new MultipartFormDataContent();
        var streamContent = new StreamContent(audio.OpenReadStream());
        streamContent.Headers.ContentType = new MediaTypeHeaderValue(audio.ContentType);

        content.Add(streamContent, "file", audio.FileName);
        content.Add(new StringContent("whisper-1"), "model");
        // ملاحظة: إزالة "language: ar" تجعل Whisper يكتشف اللغة تلقائياً (عربي أو إنجليزي)

        var request = new HttpRequestMessage(HttpMethod.Post, "https://api.openai.com/v1/audio/transcriptions");
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", _apiKey);
        request.Content = content;

        var response = await _httpClient.SendAsync(request);
        var result = await response.Content.ReadAsStringAsync();

        if (!response.IsSuccessStatusCode) return new AIResult { Summary = "Error", PriorityId = 1 };

        using var doc = JsonDocument.Parse(result);
        var transcribedText = doc.RootElement.GetProperty("text").GetString();

        var aiResult = await AnalyzeText(transcribedText ?? "", locationContext);
        aiResult.ExtractedText = transcribedText;
        return aiResult;
    }

    private async Task<AIResult> SendChat(object requestBody)
    {
        var json = JsonSerializer.Serialize(requestBody);
        var httpRequest = new HttpRequestMessage(HttpMethod.Post, "https://api.openai.com/v1/chat/completions");
        httpRequest.Headers.Authorization = new AuthenticationHeaderValue("Bearer", _apiKey);
        httpRequest.Content = new StringContent(json, Encoding.UTF8, "application/json");

        var response = await _httpClient.SendAsync(httpRequest);
        var result = await response.Content.ReadAsStringAsync();

        if (!response.IsSuccessStatusCode) return new AIResult { SectorIds = new List<int> { 5 }, PriorityId = 1, Summary = "API Error" };

        using var doc = JsonDocument.Parse(result);
        var content = doc.RootElement.GetProperty("choices")[0].GetProperty("message").GetProperty("content").GetString();

        try
        {
            return JsonSerializer.Deserialize<AIResult>(content, new JsonSerializerOptions { PropertyNameCaseInsensitive = true })
                   ?? new AIResult { SectorIds = new List<int> { 5 }, PriorityId = 1 };
        }
        catch
        {
            return new AIResult { SectorIds = new List<int> { 5 }, PriorityId = 1, Summary = "Parsing Error" };
        }
    }
}

public class AIResult
{
    public List<int> SectorIds { get; set; } = new List<int>();
    public int PriorityId { get; set; }
    public string? Summary { get; set; }
    public double Confidence { get; set; }
    public string? ExtractedText { get; set; }
}