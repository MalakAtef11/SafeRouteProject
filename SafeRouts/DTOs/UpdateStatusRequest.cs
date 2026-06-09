public class UpdateStatusRequest
{
    public string StatusCode { get; set; } = string.Empty;
    public int ChangedByUserID { get; set; }
    public string? ChangeNote { get; set; }
}