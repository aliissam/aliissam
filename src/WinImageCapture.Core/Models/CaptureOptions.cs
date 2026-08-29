namespace WinImageCapture.Core.Models;

public sealed class CaptureOptions
{
    public required string SourceDirectory { get; init; }
    public required string DestinationWimPath { get; init; }
    public required string ImageName { get; init; }
    public string? ImageDescription { get; init; }
    public CompressionLevel Compression { get; init; } = CompressionLevel.Fast;
    public bool CheckIntegrity { get; init; } = true;
}

public enum CompressionLevel
{
    None,
    Fast,
    Max,
    Recovery,
}
