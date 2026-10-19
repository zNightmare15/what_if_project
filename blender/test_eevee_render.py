import bpy
import time

start_t = time.time()

# Clear default objects
bpy.ops.wm.read_factory_settings(use_empty=True)

scene = bpy.context.scene
scene.render.engine = 'BLENDER_EEVEE_NEXT'
scene.render.resolution_x = 1080
scene.render.resolution_y = 1920
scene.render.resolution_percentage = 100
scene.render.image_settings.file_format = 'PNG'
scene.render.filepath = 'd:/Escritorio/what_if_project/test_eevee_frame.png'

# Add camera
cam_data = bpy.data.cameras.new("Camera")
cam_obj = bpy.data.objects.new("Camera", cam_data)
scene.collection.objects.link(cam_obj)
scene.camera = cam_obj
cam_obj.location = (0, -6, 2.5)
cam_obj.rotation_euler = (1.2, 0, 0)

# Add sun light
light_data = bpy.data.lights.new(name="Sun", type='SUN')
light_data.energy = 3.5
light_obj = bpy.data.objects.new(name="Sun", object_data=light_data)
scene.collection.objects.link(light_obj)
light_obj.rotation_euler = (0.7, 0.4, 0.5)

# Add ground plane
bpy.ops.mesh.primitive_plane_add(size=20, location=(0, 0, 0))
ground = bpy.context.active_object
mat_ground = bpy.data.materials.new(name="GroundMat")
mat_ground.use_nodes = True
bsdf = mat_ground.node_tree.nodes.get("Principled BSDF")
if bsdf:
    bsdf.inputs['Base Color'].default_value = (0.1, 0.4, 0.1, 1.0) # green
ground.data.materials.append(mat_ground)

# Add low-poly cube
bpy.ops.mesh.primitive_cube_add(size=1.5, location=(0, 0, 0.75))
cube = bpy.context.active_object
mat_cube = bpy.data.materials.new(name="CubeMat")
mat_cube.use_nodes = True
bsdf2 = mat_cube.node_tree.nodes.get("Principled BSDF")
if bsdf2:
    bsdf2.inputs['Base Color'].default_value = (0.9, 0.2, 0.2, 1.0) # red
cube.data.materials.append(mat_cube)

# Render single frame
bpy.ops.render.render(write_still=True)
total_t = time.time() - start_t
print(f"Render completed in {total_t:.2f} seconds!")

