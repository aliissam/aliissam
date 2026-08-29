namespace WinImageCapture.Core.Imaging;

public sealed class DismException : Exception
{
    public int ExitCode { get; }
    public string StandardError { get; }

    public DismException(string message, int exitCode, string standardError)
        : base(message)
    {
        ExitCode = exitCode;
        StandardError = standardError;
    }
}
