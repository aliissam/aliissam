namespace WinImageCapture.Core.Models;

public sealed record OperationProgress(string Stage, double? PercentComplete, string? Message = null);
