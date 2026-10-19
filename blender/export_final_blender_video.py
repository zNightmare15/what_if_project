import bpy
import subprocess
import time
import os

BLEND_FILE = "d:/Escritorio/what_if_project/scene_master.blend"
RAW_VIDEO = "d:/Escritorio/what_if_project/blender_raw_video.mp4"
FINAL_VIDEO = "d:/Escritorio/what_if_project/what_if_electrons_blender_tiktok.mp4"
AUDIO_MIX = "d:/Escritorio/what_if_project/final_audio_mix.mp3"
ASS_SUBS = "d:/Escritorio/what_if_project/hud_overlay.ass"

def render_blender_video():
    print("=== Step 1: Configuring Blender EEVEE Next Animation Output ===")
    scene = bpy.context.scene
    
    # Optimize sampling for maximum speed and clean aesthetics
    scene.eevee.taa_render_samples = 12
    for node in scene.node_tree.nodes:
        if node.type == 'GLARE':
            node.quality = 'LOW'
            
    # Set video output format to H.264 MP4 directly
    scene.render.image_settings.file_format = 'FFMPEG'
    scene.render.ffmpeg.format = 'MPEG4'
    scene.render.ffmpeg.codec = 'H264'
    scene.render.ffmpeg.constant_rate_factor = 'HIGH'
    scene.render.ffmpeg.ffmpeg_preset = 'REALTIME'
    scene.render.filepath = RAW_VIDEO
    
    # 80 seconds at 24fps = 1920 frames
    scene.frame_start = 1
    scene.frame_end = 1920
    
    print(f"Rendering 1920 frames to: {RAW_VIDEO}...")
    t0 = time.time()
    bpy.ops.render.render(animation=True)
    t1 = time.time()
    print(f"Blender raw 3D animation rendered in {t1 - t0:.1f} seconds ({(t1 - t0)/60.0:.2f} min)!")

if __name__ == "__main__":
    render_blender_video()

