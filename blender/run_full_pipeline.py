import subprocess
import time
import os

BLENDER_EXE = r"C:\Program Files\Blender Foundation\Blender 4.2\blender.exe"
BLEND_FILE = r"d:\Escritorio\what_if_project\scene_master.blend"
EXPORT_SCRIPT = r"d:\Escritorio\what_if_project\export_final_blender_video.py"
RAW_VIDEO = r"d:\Escritorio\what_if_project\blender_raw_video.mp4"
FINAL_VIDEO = r"d:\Escritorio\what_if_project\what_if_electrons_blender_tiktok.mp4"
AUDIO_MIX = r"d:\Escritorio\what_if_project\final_audio_mix.mp3"
ASS_SUBS = r"d:/Escritorio/what_if_project/hud_overlay.ass"

def main():
    total_start = time.time()
    print("=========================================================")
    print("  WHAT IF TIKTOK PIPELINE - BLENDER 4.2 EEVEE NEXT ENGINE ")
    print("=========================================================")

    # Step 1: Render 3D Animation via Blender Headless
    print("\n--- STEP 1: Rendering 3D Animation in Blender Headless ---")
    cmd_blender = [BLENDER_EXE, "-b", BLEND_FILE, "--python", EXPORT_SCRIPT]
    t0 = time.time()
    res = subprocess.run(cmd_blender, capture_output=True, text=True)
    if res.returncode != 0:
        print("Error during Blender rendering:")
        print(res.stderr[-1000:])
        raise RuntimeError("Blender rendering failed")
    t1 = time.time()
    print(f"Blender rendering completed in {t1 - t0:.1f}s ({(t1 - t0)/60.0:.2f} min).")

    # Step 2: Burn Vector ASS Subtitles & Mux Master Audio
    print("\n--- STEP 2: Burning Subtitles & Muxing Neural Audio Track ---")
    ffmpeg_ass_path = ASS_SUBS.replace("\\", "/").replace(":", "\\:")
    cmd_ffmpeg = [
        "ffmpeg", "-y",
        "-i", RAW_VIDEO,
        "-i", AUDIO_MIX,
        "-vf", f"ass={ffmpeg_ass_path}",
        "-c:v", "libx264",
        "-preset", "veryfast",
        "-crf", "18",
        "-pix_fmt", "yuv420p",
        "-c:a", "aac",
        "-b:a", "192k",
        "-shortest",
        FINAL_VIDEO
    ]
    t2 = time.time()
    res_ff = subprocess.run(cmd_ffmpeg, capture_output=True, text=True)
    if res_ff.returncode != 0:
        print("Error during FFmpeg compositing:")
        print(res_ff.stderr[-1000:])
        raise RuntimeError("FFmpeg compositing failed")
    t3 = time.time()
    print(f"FFmpeg compositing completed in {t3 - t2:.1f}s.")

    # Step 3: Extract Final Validation Snapshots
    print("\n--- STEP 3: Extracting Final Video Verification Snapshots ---")
    snaps = [
        ("00:00:02", "d:/Escritorio/what_if_project/final_snap_1_daylight.png"),
        ("00:00:10", "d:/Escritorio/what_if_project/final_snap_2_sun_flare.png"),
        ("00:00:18", "d:/Escritorio/what_if_project/final_snap_3_hands_pov.png"),
        ("00:00:46", "d:/Escritorio/what_if_project/final_snap_4_celestial_earth.png"),
        ("00:01:06", "d:/Escritorio/what_if_project/final_snap_5_lidar_back.png")
    ]
    for ts, out_snap in snaps:
        subprocess.run([
            "ffmpeg", "-y", "-ss", ts,
            "-i", FINAL_VIDEO,
            "-frames:v", "1",
            "-update", "1",
            out_snap
        ], capture_output=True)

    total_time = time.time() - total_start
    file_size_mb = os.path.getsize(FINAL_VIDEO) / (1024 * 1024)
    print("\n=========================================================")
    print(f"  SUCCESS: Video generated at: {FINAL_VIDEO}")
    print(f"  Total Duration: 80.00s | Size: {file_size_mb:.2f} MB")
    print(f"  Total Pipeline Time: {total_time:.1f}s ({total_time/60.0:.2f} min)")
    print("=========================================================")

if __name__ == "__main__":
    main()

