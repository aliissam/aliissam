namespace WinImageCapture.Core.AnswerFiles;

public sealed class AnswerFileValidationException : Exception
{
    public IReadOnlyList<string> Errors { get; }

    public AnswerFileValidationException(IReadOnlyList<string> errors)
        : base("Answer file options failed validation: " + string.Join("; ", errors))
    {
        Errors = errors;
    }
}
