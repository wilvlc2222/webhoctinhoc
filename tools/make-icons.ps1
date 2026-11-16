# Draws the app icons (Bip the robot on the site's blue) into assets/icons/.
# Run again only when the icon design changes:  powershell -File tools/make-icons.ps1
Add-Type -AssemblyName System.Drawing
$out = Join-Path (Split-Path $PSScriptRoot -Parent) 'assets\icons'
New-Item -ItemType Directory -Force $out | Out-Null

function New-Icon([int]$size, [string]$name) {
  $bmp = New-Object System.Drawing.Bitmap $size, $size
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode = 'AntiAlias'
  $g.Clear([System.Drawing.ColorTranslator]::FromHtml('#1f6fd1'))
  # the robot is drawn in a 64-unit box (same shapes as icons.js "robot"); it fills the middle 60%,
  # inside the safe zone of a maskable icon, so a round or squircle mask never cuts it
  $s = $size * 0.60 / 52.0
  $g.TranslateTransform($size / 2.0 - 32 * $s, $size / 2.0 - 27.5 * $s)
  $g.ScaleTransform($s, $s)
  $ink = [System.Drawing.ColorTranslator]::FromHtml('#1d2433')
  $pen = New-Object System.Drawing.Pen $ink, 4
  $pen.StartCap = 'Round'; $pen.EndCap = 'Round'; $pen.LineJoin = 'Round'
  $fill = New-Object System.Drawing.SolidBrush $ink
  $white = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::White)
  # head: rounded rectangle 14,18 36x32 r8
  $p = New-Object System.Drawing.Drawing2D.GraphicsPath
  $x = 14; $y = 18; $w = 36; $h = 32; $d = 16
  $p.AddArc($x, $y, $d, $d, 180, 90); $p.AddArc($x + $w - $d, $y, $d, $d, 270, 90)
  $p.AddArc($x + $w - $d, $y + $h - $d, $d, $d, 0, 90); $p.AddArc($x, $y + $h - $d, $d, $d, 90, 90)
  $p.CloseFigure()
  $g.FillPath($white, $p); $g.DrawPath($pen, $p)
  $g.DrawLine($pen, 32, 18, 32, 8); $g.FillEllipse($fill, 29, 3, 6, 6)        # antenna
  $g.FillEllipse($fill, 20, 28, 8, 8); $g.FillEllipse($fill, 36, 28, 8, 8)    # eyes
  $g.DrawLine($pen, 25, 42, 39, 42)                                           # mouth
  $g.DrawLine($pen, 8, 30, 8, 40); $g.DrawLine($pen, 56, 30, 56, 40)          # ears
  $g.Dispose()
  $bmp.Save((Join-Path $out $name), [System.Drawing.Imaging.ImageFormat]::Png)
  $bmp.Dispose()
}

New-Icon 512 'icon-512.png'
New-Icon 192 'icon-192.png'
New-Icon 180 'apple-touch-icon.png'
New-Icon 32  'favicon-32.png'
Get-ChildItem $out | ForEach-Object { '{0} {1}' -f $_.Name, $_.Length }
