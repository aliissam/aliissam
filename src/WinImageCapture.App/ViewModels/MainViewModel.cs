using System.Collections.ObjectModel;
using System.Windows;
using WinImageCapture.App.Services;
using WinImageCapture.Core.Imaging;

namespace WinImageCapture.App.ViewModels;

public sealed class MainViewModel : ViewModelBase
{
    public ObservableCollection<string> LogLines { get; } = new();

    public CaptureViewModel Capture { get; }

    public AnswerFileViewModel AnswerFile { get; }

    public ApplyViewModel Apply { get; }

    public bool IsElevated { get; }

    public MainViewModel()
    {
        IsElevated = ElevationChecker.IsRunningAsAdministrator();

        var processRunner = new SystemProcessRunner();
        var imagingService = new ImagingService(processRunner, DismLocator.ResolveExecutablePath());

        Capture = new CaptureViewModel(imagingService, AppendLog);
        AnswerFile = new AnswerFileViewModel(imagingService, AppendLog);
        Apply = new ApplyViewModel(imagingService, AppendLog);

        if (!IsElevated)
        {
            AppendLog("Warning: not running as administrator. DISM operations will fail without elevation.");
        }
    }

    private void AppendLog(string message)
    {
        var line = $"[{DateTime.Now:HH:mm:ss}] {message}";
        Serilog.Log.Information(message);

        if (System.Windows.Application.Current?.Dispatcher.CheckAccess() == true)
        {
            LogLines.Add(line);
        }
        else
        {
            System.Windows.Application.Current?.Dispatcher.Invoke(() => LogLines.Add(line));
        }
    }
}
