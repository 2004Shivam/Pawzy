# pawzy-core-windows.spec
# PyInstaller spec for bundling the Pawzy Python backend on Windows.
# Run from Windows: pyinstaller pawzy-core-windows.spec

block_cipher = None

a = Analysis(
    ['main.py'],
    pathex=['.'],
    binaries=[],
    datas=[
        ('assets', 'assets'),
    ],
    hiddenimports=[
        # PyQt6
        'PyQt6',
        'PyQt6.QtCore',
        'PyQt6.QtGui',
        'PyQt6.QtWidgets',
        'PyQt6.sip',
        # WebSockets
        'websockets',
        'websockets.server',
        'websockets.legacy',
        'websockets.legacy.server',
        'websockets.legacy.client',
        # System monitoring
        'psutil',
        'psutil._pswindows',
        'psutil._common',
        # Windows window tracking
        'win32gui',
        'win32process',
        'win32con',
        'pywintypes',
        # Stdlib
        'asyncio',
        'asyncio.events',
        'asyncio.futures',
        'asyncio.tasks',
    ],
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=[
        'tkinter', 'matplotlib', 'numpy', 'scipy',
        'Xlib', 'ewmh',           # Linux-only — not needed on Windows
        'psutil._pslinux',
    ],
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
    upx=False,
    console=False,          # hide the console window on Windows
    icon='assets/tray_icon.png',
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
