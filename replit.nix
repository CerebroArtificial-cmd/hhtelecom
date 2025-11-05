{ pkgs }: {
  deps = [
    pkgs.nodejs_20
    pkgs.python311
    pkgs.python311Packages.pip
    pkgs.bash
    pkgs.git
  ];
}
