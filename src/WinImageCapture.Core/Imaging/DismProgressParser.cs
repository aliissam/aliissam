using System.Globalization;
using System.Text.RegularExpressions;

namespace WinImageCapture.Core.Imaging;

public static partial class DismProgressParser
{
    [GeneratedRegex(@"(\d{1,3}(?:\.\d+)?)\s*%")]
    private static partial Regex PercentRegex();

    /// <summary>
    /// Extracts a completion percentage from a line of dism.exe console output, e.g.
    /// "[==========53.0%==========            ]". Returns null if the line has no percentage.
    /// </summary>
    public static double? TryParsePercent(string line)
    {
        var match = PercentRegex().Match(line);
        if (!match.Success)
        {
            return null;
        }

        if (double.TryParse(match.Groups[1].Value, NumberStyles.Float, CultureInfo.InvariantCulture, out var value))
        {
            return Math.Clamp(value, 0, 100);
        }

        return null;
    }
}
