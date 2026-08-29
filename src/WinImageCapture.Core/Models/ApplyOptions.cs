namespace WinImageCapture.Core.Models;

public sealed class ApplyOptions
{
    public required string SourceWimPath { get; init; }
    public int ImageIndex { get; init; } = 1;
    public required string TargetDirectory { get; init; }
}
