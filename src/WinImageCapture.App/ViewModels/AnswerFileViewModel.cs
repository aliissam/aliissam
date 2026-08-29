using System.Windows;
using Microsoft.Win32;
using WinImageCapture.Core.AnswerFiles;
using WinImageCapture.Core.Imaging;
using WinImageCapture.Core.Models;

namespace WinImageCapture.App.ViewModels;

public sealed class AnswerFileViewModel : ViewModelBase
{
    private readonly ImagingService _imagingService;
    private readonly Action<string> _log;

    private string _computerName = "*";
    private string _organization = string.Empty;
    private string _owner = string.Empty;
    private string _timeZone = "UTC";
    private string _productKey = string.Empty;
    private string _adminPassword = string.Empty;
    private bool _autoLogon;
    private bool _hideEulaPage = true;
    private bool _skipMachineOobe = true;
    private bool _skipUserOobe = true;
    private string _localAccountName = string.Empty;
    private string _localAccountPassword = string.Empty;
    private string _firstLogonCommands = string.Empty;

    private string _targetWimPath = string.Empty;
    private int _targetImageIndex = 1;
    private string _statusMessage = "Ready.";
    private bool _isBusy;

    public AnswerFileViewModel(ImagingService imagingService, Action<string> log)
    {
        _imagingService = imagingService;
        _log = log;
        SaveAnswerFileCommand = new RelayCommand(SaveAnswerFileAsync);
        BrowseTargetWimCommand = new RelayCommand(BrowseTargetWimAsync);
        InjectCommand = new RelayCommand(InjectAsync, () => !IsBusy && !string.IsNullOrWhiteSpace(TargetWimPath));
    }

    public string ComputerName { get => _computerName; set => SetField(ref _computerName, value); }

    public string Organization { get => _organization; set => SetField(ref _organization, value); }

    public string Owner { get => _owner; set => SetField(ref _owner, value); }

    public string TimeZone { get => _timeZone; set => SetField(ref _timeZone, value); }

    public string ProductKey { get => _productKey; set => SetField(ref _productKey, value); }

    public string AdminPassword { get => _adminPassword; set => SetField(ref _adminPassword, value); }

    public bool AutoLogon { get => _autoLogon; set => SetField(ref _autoLogon, value); }

    public bool HideEulaPage { get => _hideEulaPage; set => SetField(ref _hideEulaPage, value); }

    public bool SkipMachineOobe { get => _skipMachineOobe; set => SetField(ref _skipMachineOobe, value); }

    public bool SkipUserOobe { get => _skipUserOobe; set => SetField(ref _skipUserOobe, value); }

    public string LocalAccountName { get => _localAccountName; set => SetField(ref _localAccountName, value); }

    public string LocalAccountPassword { get => _localAccountPassword; set => SetField(ref _localAccountPassword, value); }

    public string FirstLogonCommands { get => _firstLogonCommands; set => SetField(ref _firstLogonCommands, value); }

    public string TargetWimPath { get => _targetWimPath; set => SetField(ref _targetWimPath, value); }

    public int TargetImageIndex { get => _targetImageIndex; set => SetField(ref _targetImageIndex, value); }

    public string StatusMessage { get => _statusMessage; private set => SetField(ref _statusMessage, value); }

    public bool IsBusy { get => _isBusy; private set => SetField(ref _isBusy, value); }

    public RelayCommand SaveAnswerFileCommand { get; }

    public RelayCommand BrowseTargetWimCommand { get; }

    public RelayCommand InjectCommand { get; }

    private AnswerFileOptions BuildOptions()
    {
        var options = new AnswerFileOptions
        {
            ComputerName = string.IsNullOrWhiteSpace(ComputerName) ? "*" : ComputerName,
            Organization = Organization,
            Owner = Owner,
            TimeZone = TimeZone,
            ProductKey = string.IsNullOrWhiteSpace(ProductKey) ? null : ProductKey,
            AdministratorPassword = string.IsNullOrWhiteSpace(AdminPassword) ? null : AdminPassword,
            AutoLogon = AutoLogon,
            HideEulaPage = HideEulaPage,
            SkipMachineOobe = SkipMachineOobe,
            SkipUserOobe = SkipUserOobe,
        };

        if (!string.IsNullOrWhiteSpace(LocalAccountName))
        {
            options.LocalAccounts.Add(new LocalAccount
            {
                Name = LocalAccountName,
                Password = LocalAccountPassword,
                DisplayName = LocalAccountName,
            });
        }

        foreach (var line in FirstLogonCommands.Split('\n', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries))
        {
            options.FirstLogonCommands.Add(line);
        }

        return options;
    }

    private Task SaveAnswerFileAsync()
    {
        try
        {
            var xml = AnswerFileBuilder.BuildXmlString(BuildOptions());

            var dialog = new SaveFileDialog
            {
                Title = "Save answer file",
                Filter = "Unattend XML (*.xml)|*.xml",
                FileName = "unattend.xml",
            };

            if (dialog.ShowDialog() == true)
            {
                File.WriteAllText(dialog.FileName, xml);
                StatusMessage = $"Saved answer file to {dialog.FileName}";
                _log(StatusMessage);
            }
        }
        catch (AnswerFileValidationException ex)
        {
            StatusMessage = "Answer file is invalid.";
            MessageBox.Show(string.Join(Environment.NewLine, ex.Errors), "Invalid answer file", MessageBoxButton.OK, MessageBoxImage.Warning);
        }

        return Task.CompletedTask;
    }

    private Task BrowseTargetWimAsync()
    {
        var dialog = new OpenFileDialog
        {
            Title = "Select the image to inject the answer file into",
            Filter = "Windows Image (*.wim)|*.wim",
        };
        if (dialog.ShowDialog() == true)
        {
            TargetWimPath = dialog.FileName;
        }

        return Task.CompletedTask;
    }

    private async Task InjectAsync()
    {
        IsBusy = true;
        StatusMessage = "Injecting answer file...";
        _log($"Injecting answer file into '{TargetWimPath}' (index {TargetImageIndex})");

        try
        {
            var xml = AnswerFileBuilder.BuildXmlString(BuildOptions());
            var progress = new Progress<OperationProgress>(p =>
            {
                if (p.Message is not null)
                {
                    _log(p.Message);
                }
            });

            await _imagingService.InjectAnswerFileAsync(TargetWimPath, TargetImageIndex, xml, progress, CancellationToken.None);
            StatusMessage = "Answer file injected successfully.";
            _log(StatusMessage);
        }
        catch (AnswerFileValidationException ex)
        {
            StatusMessage = "Answer file is invalid.";
            MessageBox.Show(string.Join(Environment.NewLine, ex.Errors), "Invalid answer file", MessageBoxButton.OK, MessageBoxImage.Warning);
        }
        catch (Exception ex)
        {
            StatusMessage = $"Injection failed: {ex.Message}";
            _log(StatusMessage);
            MessageBox.Show(ex.Message, "Injection failed", MessageBoxButton.OK, MessageBoxImage.Error);
        }
        finally
        {
            IsBusy = false;
        }
    }
}
