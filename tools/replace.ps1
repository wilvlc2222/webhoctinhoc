param([string]$Rules)
# Rules file (UTF-8): file<TAB>old<TAB>new<TAB>expectedCount. Literal replace; aborts the file if the count differs.
$ErrorActionPreference = 'Stop'
[Console]::OutputEncoding = [Text.Encoding]::UTF8
$enc = New-Object Text.UTF8Encoding $false
$rows = Get-Content -Encoding UTF8 $Rules | Where-Object { $_ -and -not $_.StartsWith('#') } | ForEach-Object { ,($_ -split "`t") }
$byFile = $rows | Group-Object { $_[0] }
foreach ($g in $byFile) {
  $p = $g.Name; $t = [IO.File]::ReadAllText($p, [Text.Encoding]::UTF8); $bad = $false
  foreach ($r in $g.Group) {
    $n = ([regex]::Matches($t, [regex]::Escape($r[1]))).Count
    if ($n -ne [int]$r[3]) { "MISMATCH $p '$($r[1])' found $n expected $($r[3])"; $bad = $true; continue }
    $t = $t.Replace($r[1], $r[2])
  }
  if ($bad) { "SKIPPED $p" } else { [IO.File]::WriteAllText($p, $t, $enc); "OK $p ($($g.Count) rules)" }
}
