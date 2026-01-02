#!/usr/bin/env python3
"""
URDF to GLB Converter using Blender (Headless Mode)

This script imports a URDF file into Blender and exports it as GLB format.
Requires Blender with URDF importer addon installed.

Installation of URDF Importer Addon:
1. Download from: https://github.com/jonathanlinat/blender-urdf (if available)
   or search for "Blender URDF importer" addon
2. Install in Blender: Edit > Preferences > Add-ons > Install
3. Enable the addon

Usage:
    blender --background --python urdf_to_glb.py <urdf_path> <output_glb_path>

Example:
    blender --background --python urdf_to_glb.py /path/to/robot.urdf /path/to/output.glb
"""

import bpy
import sys
import os

def urdf_to_glb(urdf_path, glb_path):
    """
    Convert URDF file to GLB using Blender.

    Args:
        urdf_path (str): Path to the input URDF file
        glb_path (str): Path for the output GLB file
    """
    # Clear existing scene
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete(use_global=False)

    # Import URDF
    try:
        bpy.ops.import_scene.urdf(filepath=urdf_path)
        print(f"Successfully imported URDF: {urdf_path}")
    except Exception as e:
        print(f"Error importing URDF: {e}")
        return False

    # Select all imported objects
    bpy.ops.object.select_all(action='SELECT')

    # Export as GLB
    try:
        bpy.ops.export_scene.gltf(
            filepath=glb_path,
            export_format='GLB',
            use_selection=True,
            export_materials='EXPORT',
            export_animations=False
        )
        print(f"Successfully exported GLB: {glb_path}")
        return True
    except Exception as e:
        print(f"Error exporting GLB: {e}")
        return False

def main():
    print("sys.argv:", sys.argv)
    # When run as: blender --background --python script.py arg1 arg2
    # sys.argv = ['blender', '--background', '--python', 'script.py', 'arg1', 'arg2']
    if len(sys.argv) < 6:
        print("Usage: blender --background --python urdf_to_glb.py <urdf_path> <output_glb_path>")
        sys.exit(1)

    urdf_path = sys.argv[4]
    glb_path = sys.argv[5]

    # Check if URDF file exists
    if not os.path.exists(urdf_path):
        print(f"URDF file not found: {urdf_path}")
        sys.exit(1)

    # Create output directory if it doesn't exist
    output_dir = os.path.dirname(glb_path)
    if output_dir and not os.path.exists(output_dir):
        os.makedirs(output_dir)

    success = urdf_to_glb(urdf_path, glb_path)
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()