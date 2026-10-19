import bpy
import time

scene = bpy.context.scene
scene.frame_set(48)

# Test 1: 16 samples, Medium Glare
scene.eevee.taa_render_samples = 16
for node in scene.node_tree.nodes:
    if node.type == 'GLARE':
        node.quality = 'MEDIUM'

scene.render.filepath = 'd:/Escritorio/what_if_project/test_speed_16.png'
t0 = time.time()
bpy.ops.render.render(write_still=True)
t1 = time.time()
print(f"16 samples + Medium Glare: {t1 - t0:.3f} seconds!")

# Test 2: 8 samples, Low Glare
scene.eevee.taa_render_samples = 8
for node in scene.node_tree.nodes:
    if node.type == 'GLARE':
        node.quality = 'LOW'

scene.render.filepath = 'd:/Escritorio/what_if_project/test_speed_8.png'
t0 = time.time()
bpy.ops.render.render(write_still=True)
t1 = time.time()
print(f"8 samples + Low Glare: {t1 - t0:.3f} seconds!")

