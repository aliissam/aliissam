using System.Windows;
using System.Windows.Controls;

namespace WinImageCapture.App.Views;

public partial class AnswerFileView : UserControl
{
    public AnswerFileView()
    {
        InitializeComponent();
    }

    private void AdminPasswordBox_PasswordChanged(object sender, RoutedEventArgs e)
    {
        if (DataContext is ViewModels.AnswerFileViewModel viewModel)
        {
            viewModel.AdminPassword = AdminPasswordBox.Password;
        }
    }

    private void LocalPasswordBox_PasswordChanged(object sender, RoutedEventArgs e)
    {
        if (DataContext is ViewModels.AnswerFileViewModel viewModel)
        {
            viewModel.LocalAccountPassword = LocalPasswordBox.Password;
        }
    }
}
