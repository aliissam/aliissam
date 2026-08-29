using WinImageCapture.Core.Imaging;
using Xunit;

namespace WinImageCapture.Core.Tests;

public class DismProgressParserTests
{
    [Theory]
    [InlineData("[==========53.0%==========            ]", 53.0)]
    [InlineData("Applying progress: 7%", 7.0)]
    [InlineData("100.0%", 100.0)]
    [InlineData("0%", 0.0)]
    public void TryParsePercent_ExtractsPercentValue(string line, double expected)
    {
        var result = DismProgressParser.TryParsePercent(line);

        Assert.Equal(expected, result);
    }

    [Fact]
    public void TryParsePercent_ReturnsNullWhenNoPercentagePresent()
    {
        var result = DismProgressParser.TryParsePercent("The operation completed successfully.");

        Assert.Null(result);
    }
}
