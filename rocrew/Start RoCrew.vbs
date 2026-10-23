' Starts RoCrew with no windows: it lives in the system tray (bottom right, near the clock).
' Double-click the tray icon to open RoCrew; right-click it to quit.
' For a visible log window instead (handy if something goes wrong), use Start RoCrew.bat.
Dim fso, shell, here, arg
Set fso = CreateObject("Scripting.FileSystemObject")
Set shell = CreateObject("WScript.Shell")
here = fso.GetParentFolderName(WScript.ScriptFullName)
arg = ""
If WScript.Arguments.Count > 0 Then arg = " " & WScript.Arguments(0)
shell.CurrentDirectory = here
shell.Run "powershell -NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File """ & here & "\studio\tray.ps1""" & arg, 0, False
