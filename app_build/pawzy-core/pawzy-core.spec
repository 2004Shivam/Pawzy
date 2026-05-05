# pawzy-core.spec
# PyInstaller spec for bundling the Pawzy Python backend into a standalone binary.
# Build with: pyinstaller pawzy-core.spec

block_cipher = None

a = Analysis(
    ['main.py'],
    pathex=['.'],
    binaries=[],
    datas=[
        ('assets', 'assets'),  # tray icons, etc.
    ],
    hiddenimports=[
        # pystray & Pillow
        'pystray',
        'PIL',
        'PIL._imaging',
        'PIL.Image',
        # WebSockets
        'websockets',
        'websockets.server',
        'websockets.legacy',
        'websockets.legacy.server',
        'websockets.legacy.client',
        # System monitoring
        'psutil',
        'psutil._pslinux',
        'psutil._common',
        # X11 / Linux window tracking
        'Xlib',
        'Xlib.display',
        'Xlib.X',
        'Xlib.XK',
        'Xlib.protocol',
        'Xlib.ext',
        'ewmh',
        # Stdlib asyncio
        'asyncio',
        'asyncio.events',
        'asyncio.futures',
        'asyncio.tasks',
    ],
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=['tkinter', 'matplotlib', 'numpy', 'scipy'],
    win_no_prefer_redirects=False,
    win_private_assemblies=False,
    cipher=block_cipher,
    noarchive=False,
)

pyz = PYZ(a.pure, a.zipped_data, cipher=block_cipher)

exe = EXE(
    pyz,
    a.scripts,
    [],
    exclude_binaries=True,
    name='pawzy-core',
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=False,  # UPX can break Qt binaries on Linux
    console=True,  # keep console for debug output; hide via Electron's spawn
)

coll = COLLECT(
    exe,
    a.binaries,
    a.zipfiles,
    a.datas,
    strip=False,
    upx=False,
    upx_exclude=[],
    name='pawzy-core',
)
