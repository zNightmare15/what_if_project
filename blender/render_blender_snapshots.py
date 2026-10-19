import bpy
import os

frames_to_render = [
    (48, "d:/Escritorio/what_if_project/blender_snap_1_daylight.png"),
    (240, "d:/Escritorio/what_if_project/blender_snap_2_sun_flare.png"),
    (450, "d:/Escritorio/what_if_project/blender_snap_3_hands_pov.png"),
    (1050, "d:/Escritorio/what_if_project/blender_snap_4_celestial_earth.png"),
    (1600, "d:/Escritorio/what_if_project/blender_snap_5_lidar_park.png")
]

scene = bpy.context.scene

for frame_num, output_path in frames_to_render:
    scene.frame_set(frame_num)
    scene.render.filepath = output_path
    print(f"Rendering frame {frame_num} -> {output_path}...")
    bpy.ops.render.render(write_still=True)

print("All snapshots rendered successfully!")

