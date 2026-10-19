import bpy
import math
import os

def setup_blender_project(save_path="d:/Escritorio/what_if_project/scene_master.blend"):
    bpy.ops.wm.read_factory_settings(use_empty=True)
    scene = bpy.context.scene

    # TikTok 9:16 Vertical, 24fps, 1920 frames = 80s
    scene.render.engine = 'BLENDER_EEVEE_NEXT'
    scene.render.resolution_x = 1080
    scene.render.resolution_y = 1920
    scene.render.resolution_percentage = 100
    scene.render.fps = 24
    scene.frame_start = 1
    scene.frame_end = 1920
    
    if hasattr(scene.eevee, "taa_render_samples"):
        scene.eevee.taa_render_samples = 32
        
    scene.view_settings.view_transform = 'AgX'
    scene.view_settings.look = 'AgX - Medium High Contrast'
    
    # Enable Compositor with Glare (Bloom & Anamorphic Streak)
    scene.use_nodes = True
    tree = scene.node_tree
    for node in tree.nodes:
        tree.nodes.remove(node)
        
    render_layers = tree.nodes.new(type='CompositorNodeRLayers')
    render_layers.location = (0, 0)
    
    # Fog Glow (Soft Optical Bloom)
    glare_fog = tree.nodes.new(type='CompositorNodeGlare')
    glare_fog.glare_type = 'FOG_GLOW'
    glare_fog.quality = 'HIGH'
    glare_fog.threshold = 1.6
    glare_fog.size = 8
    glare_fog.location = (300, 100)
    
    # Horizontal Anamorphic Streak (Solar Lens Flare)
    glare_streak = tree.nodes.new(type='CompositorNodeGlare')
    glare_streak.glare_type = 'STREAKS'
    glare_streak.streaks = 2
    glare_streak.angle_offset = 0
    glare_streak.threshold = 3.2
    glare_streak.location = (550, 100)
    
    composite = tree.nodes.new(type='CompositorNodeComposite')
    composite.location = (800, 0)
    
    tree.links.new(render_layers.outputs['Image'], glare_fog.inputs['Image'])
    tree.links.new(glare_fog.outputs['Image'], glare_streak.inputs['Image'])
    tree.links.new(glare_streak.outputs['Image'], composite.inputs['Image'])
    
    # Helper: Set visibility with recursive propagation to all child meshes
    def set_visibility_range(root_obj, visible_start, visible_end):
        targets = [root_obj] + list(root_obj.children_recursive)
        for obj in targets:
            if visible_start > 1:
                obj.hide_render = True
                obj.keyframe_insert(data_path="hide_render", frame=1)
                obj.hide_render = True
                obj.keyframe_insert(data_path="hide_render", frame=visible_start - 1)
            
            obj.hide_render = False
            obj.keyframe_insert(data_path="hide_render", frame=visible_start)
            obj.hide_render = False
            obj.keyframe_insert(data_path="hide_render", frame=visible_end)
            
            if visible_end < 1920:
                obj.hide_render = True
                obj.keyframe_insert(data_path="hide_render", frame=visible_end + 1)

    # -------------------------------------------------------------
    # WORLD SHADER (Daylight -> Starfield Space -> LiDAR Indigo -> Black)
    # -------------------------------------------------------------
    world = bpy.data.worlds.new(name="WhatIfWorld")
    scene.world = world
    world.use_nodes = True
    wtree = world.node_tree
    wnodes = wtree.nodes
    wnodes.clear()
    
    w_out = wnodes.new(type='ShaderNodeOutputWorld')
    w_bg = wnodes.new(type='ShaderNodeBackground')
    wtree.links.new(w_bg.outputs['Background'], w_out.inputs['Surface'])
    
    # Daylight blue-grey (Frames 1-180)
    w_bg.inputs['Color'].default_value = (0.55, 0.68, 0.82, 1.0)
    w_bg.inputs['Strength'].default_value = 0.9
    w_bg.inputs['Color'].keyframe_insert(data_path="default_value", frame=1)
    w_bg.inputs['Color'].keyframe_insert(data_path="default_value", frame=180)
    
    # Space black (Frames 181-1500)
    w_bg.inputs['Color'].default_value = (0.001, 0.002, 0.005, 1.0)
    w_bg.inputs['Strength'].default_value = 1.0
    w_bg.inputs['Color'].keyframe_insert(data_path="default_value", frame=181)
    w_bg.inputs['Color'].keyframe_insert(data_path="default_value", frame=1500)
    
    # Indigo LiDAR space (Frames 1501-1800)
    w_bg.inputs['Color'].default_value = (0.005, 0.012, 0.03, 1.0)
    w_bg.inputs['Color'].keyframe_insert(data_path="default_value", frame=1501)
    w_bg.inputs['Color'].keyframe_insert(data_path="default_value", frame=1800)
    
    # Pure black outro (Frames 1801-1920)
    w_bg.inputs['Color'].default_value = (0.0, 0.0, 0.0, 1.0)
    w_bg.inputs['Color'].keyframe_insert(data_path="default_value", frame=1801)

    # -------------------------------------------------------------
    # LIGHTING
    # -------------------------------------------------------------
    sun_data = bpy.data.lights.new(name="SunDaylight", type='SUN')
    sun_data.energy = 3.6
    sun_data.color = (1.0, 0.98, 0.92)
    sun_obj = bpy.data.objects.new(name="SunDaylight", object_data=sun_data)
    scene.collection.objects.link(sun_obj)
    sun_obj.rotation_euler = (math.radians(45), math.radians(25), math.radians(30))
    
    sun_data.keyframe_insert(data_path="energy", frame=1)
    sun_data.keyframe_insert(data_path="energy", frame=180)
    sun_data.energy = 0.0
    sun_data.keyframe_insert(data_path="energy", frame=181)

    # Space Blazing Sun (Upper right in frame, with streak lens flare)
    bpy.ops.mesh.primitive_uv_sphere_add(radius=2.2, location=(8.0, 28.0, 15.0))
    space_sun = bpy.context.active_object
    space_sun.name = "SpaceSunOrb"
    mat_sun = bpy.data.materials.new(name="BlazingSunMat")
    mat_sun.use_nodes = True
    s_emit = mat_sun.node_tree.nodes.new(type='ShaderNodeEmission')
    s_emit.inputs['Color'].default_value = (1.0, 1.0, 1.0, 1.0)
    s_emit.inputs['Strength'].default_value = 35.0
    mat_sun.node_tree.links.new(s_emit.outputs['Emission'], mat_sun.node_tree.nodes.get('Material Output').inputs['Surface'])
    space_sun.data.materials.append(mat_sun)
    
    set_visibility_range(space_sun, 181, 920)

    # -------------------------------------------------------------
    # CAMERA ANIMATION
    # -------------------------------------------------------------
    cam_data = bpy.data.cameras.new("MainCamera")
    cam_data.lens = 32
    cam_data.sensor_width = 36
    cam_obj = bpy.data.objects.new("MainCamera", cam_data)
    scene.collection.objects.link(cam_obj)
    scene.camera = cam_obj
    
    # Scene 1: Central Park Daylight (Frames 1-180)
    cam_obj.location = (0, -11.0, 3.8)
    cam_obj.rotation_euler = (math.radians(78), 0, 0)
    cam_obj.keyframe_insert(data_path="location", frame=1)
    cam_obj.keyframe_insert(data_path="rotation_euler", frame=1)
    cam_obj.location = (0, -9.8, 3.6)
    cam_obj.keyframe_insert(data_path="location", frame=180)
    cam_obj.keyframe_insert(data_path="rotation_euler", frame=180)

    # Scene 2: Sun flare & X-Ray Park Overview (Frames 181-339)
    cam_obj.location = (0, -9.5, 3.4)
    cam_obj.rotation_euler = (math.radians(70), 0, math.radians(14)) # Tilted towards Sun
    cam_obj.keyframe_insert(data_path="location", frame=181)
    cam_obj.keyframe_insert(data_path="rotation_euler", frame=181)
    cam_obj.location = (0, -9.0, 3.2)
    cam_obj.keyframe_insert(data_path="location", frame=339)
    cam_obj.keyframe_insert(data_path="rotation_euler", frame=339)

    # Scene 3: First Person Hands POV (Frames 340-580)
    cam_obj.location = (0, -3.0, 1.4)
    cam_obj.rotation_euler = (math.radians(55), 0, 0)
    cam_obj.keyframe_insert(data_path="location", frame=340)
    cam_obj.keyframe_insert(data_path="rotation_euler", frame=340)
    cam_obj.location = (0, -2.8, 1.45)
    cam_obj.keyframe_insert(data_path="location", frame=580)
    cam_obj.keyframe_insert(data_path="rotation_euler", frame=580)

    # Scene 4: Disintegration / Looking Up (Frames 581-920)
    cam_obj.location = (0, -8.0, 2.0)
    cam_obj.rotation_euler = (math.radians(65), 0, 0)
    cam_obj.keyframe_insert(data_path="location", frame=581)
    cam_obj.keyframe_insert(data_path="rotation_euler", frame=581)
    cam_obj.location = (0, -7.5, 3.0)
    cam_obj.rotation_euler = (math.radians(50), 0, 0)
    cam_obj.keyframe_insert(data_path="location", frame=920)
    cam_obj.keyframe_insert(data_path="rotation_euler", frame=920)

    # Scene 5: Celestial Scale - Earth & Moon (Frames 921-1500)
    cam_obj.location = (0, -65.0, 8.0)
    cam_obj.rotation_euler = (math.radians(85), 0, 0)
    cam_obj.keyframe_insert(data_path="location", frame=921)
    cam_obj.keyframe_insert(data_path="rotation_euler", frame=921)
    cam_obj.location = (0, -85.0, 12.0)
    cam_obj.keyframe_insert(data_path="location", frame=1500)
    cam_obj.keyframe_insert(data_path="rotation_euler", frame=1500)

    # Scene 6: LiDAR Point Cloud Central Park (Frames 1501-1800)
    cam_obj.location = (0, -10.5, 3.6)
    cam_obj.rotation_euler = (math.radians(77), 0, 0)
    cam_obj.keyframe_insert(data_path="location", frame=1501)
    cam_obj.keyframe_insert(data_path="rotation_euler", frame=1501)
    cam_obj.location = (0, -9.0, 3.4)
    cam_obj.keyframe_insert(data_path="location", frame=1800)
    cam_obj.keyframe_insert(data_path="rotation_euler", frame=1800)

    # -------------------------------------------------------------
    # MATERIALS
    # -------------------------------------------------------------
    mat_grass = bpy.data.materials.new(name="ParkGrassMat")
    mat_grass.use_nodes = True
    g_bsdf = mat_grass.node_tree.nodes.get("Principled BSDF")
    g_bsdf.inputs['Base Color'].default_value = (0.12, 0.42, 0.08, 1.0)
    g_bsdf.inputs['Roughness'].default_value = 0.85

    mat_blanket = bpy.data.materials.new(name="BlanketCheckerMat")
    mat_blanket.use_nodes = True
    b_tex = mat_blanket.node_tree.nodes.new(type='ShaderNodeTexChecker')
    b_tex.inputs['Scale'].default_value = 8.0
    b_tex.inputs['Color1'].default_value = (0.85, 0.12, 0.12, 1.0)
    b_tex.inputs['Color2'].default_value = (0.95, 0.95, 0.95, 1.0)
    mat_blanket.node_tree.links.new(b_tex.outputs['Color'], mat_blanket.node_tree.nodes.get("Principled BSDF").inputs['Base Color'])

    def create_color_mat(name, color_rgba):
        mat = bpy.data.materials.new(name=name)
        mat.use_nodes = True
        bsdf = mat.node_tree.nodes.get("Principled BSDF")
        bsdf.inputs['Base Color'].default_value = color_rgba
        bsdf.inputs['Roughness'].default_value = 0.7
        return mat

    mat_skin = create_color_mat("SkinMat", (0.82, 0.65, 0.52, 1.0))
    mat_shirt_blue = create_color_mat("BlueShirtMat", (0.45, 0.65, 0.85, 1.0))
    mat_suit_navy = create_color_mat("NavySuitMat", (0.08, 0.18, 0.45, 1.0))
    mat_shirt_yellow = create_color_mat("YellowShirtMat", (0.85, 0.80, 0.35, 1.0))
    mat_pants_white = create_color_mat("WhitePantsMat", (0.88, 0.88, 0.90, 1.0))
    mat_tree_wood = create_color_mat("WoodMat", (0.28, 0.16, 0.08, 1.0))
    mat_tree_leaf = create_color_mat("FoliageMat", (0.05, 0.22, 0.06, 1.0))
    mat_skyscrapers = create_color_mat("TowerMat", (0.40, 0.42, 0.45, 1.0))

    # X-Ray Wireframe Glow Material (Cyan-White Neon)
    mat_xray_edge = bpy.data.materials.new(name="XRayGlowMat")
    mat_xray_edge.use_nodes = True
    x_emit = mat_xray_edge.node_tree.nodes.new(type='ShaderNodeEmission')
    x_emit.inputs['Color'].default_value = (0.85, 0.95, 1.0, 1.0)
    x_emit.inputs['Strength'].default_value = 3.5
    mat_xray_edge.node_tree.links.new(x_emit.outputs['Emission'], mat_xray_edge.node_tree.nodes.get('Material Output').inputs['Surface'])

    # LiDAR Point Cloud Material (Deep Cyan Shimmer)
    mat_lidar = bpy.data.materials.new(name="LidarPointMat")
    mat_lidar.use_nodes = True
    l_emit = mat_lidar.node_tree.nodes.new(type='ShaderNodeEmission')
    l_emit.inputs['Color'].default_value = (0.4, 0.8, 1.0, 1.0)
    l_emit.inputs['Strength'].default_value = 4.5
    mat_lidar.node_tree.links.new(l_emit.outputs['Emission'], mat_lidar.node_tree.nodes.get('Material Output').inputs['Surface'])

    # -------------------------------------------------------------
    # 1. DAYLIGHT PARK GROUP (Visible Frames 1 - 180)
    # -------------------------------------------------------------
    park_day_grp = bpy.data.objects.new("ParkDaylightGroup", None)
    scene.collection.objects.link(park_day_grp)

    bpy.ops.mesh.primitive_plane_add(size=120, location=(0, 20, 0))
    ground = bpy.context.active_object
    ground.name = "CentralParkGround"
    ground.data.materials.append(mat_grass)
    ground.parent = park_day_grp

    bpy.ops.mesh.primitive_plane_add(size=3.4, location=(0, 0, 0.02))
    blanket = bpy.context.active_object
    blanket.name = "PicnicBlanket"
    blanket.scale = (1.2, 0.9, 1.0)
    blanket.data.materials.append(mat_blanket)
    blanket.parent = park_day_grp

    def create_seated_human(name, x, y, z, rot_z, shirt_mat, pants_mat, parent, is_wireframe=False):
        grp = bpy.data.objects.new(name, None)
        scene.collection.objects.link(grp)
        grp.location = (x, y, z)
        grp.rotation_euler = (0, 0, math.radians(rot_z))
        grp.parent = parent

        parts = [
            ("torso", (0, 0, 0.55), (0.7, 0.45, 0.9), (0, 0, 0), shirt_mat if not is_wireframe else mat_xray_edge),
            ("head", (0, 0, 1.05), (0.44, 0.44, 0.44), (0, 0, 0), mat_skin if not is_wireframe else mat_xray_edge),
            ("leg_l", (-0.18, 0.35, 0.2), (0.35, 1.1, 0.35), (20, 0, 0), pants_mat if not is_wireframe else mat_xray_edge),
            ("leg_r", (0.18, 0.35, 0.2), (0.35, 1.1, 0.35), (20, 0, 0), pants_mat if not is_wireframe else mat_xray_edge),
            ("arm_l", (-0.32, 0.1, 0.5), (0.28, 0.28, 0.9), (-25, 0, 15), mat_skin if not is_wireframe else mat_xray_edge),
            ("arm_r", (0.32, 0.1, 0.5), (0.28, 0.28, 0.9), (-25, 0, -15), mat_skin if not is_wireframe else mat_xray_edge)
        ]
        for pname, ploc, pscale, prot, pmat in parts:
            bpy.ops.mesh.primitive_cube_add(size=0.5, location=ploc)
            part = bpy.context.active_object
            part.scale = pscale
            part.rotation_euler = (math.radians(prot[0]), math.radians(prot[1]), math.radians(prot[2]))
            if is_wireframe:
                wf = part.modifiers.new(name="Wireframe", type='WIREFRAME')
                wf.thickness = 0.015
            part.data.materials.append(pmat)
            part.parent = grp
        return grp

    create_seated_human("Person_Left_Day", -0.9, -0.3, 0.0, 30, mat_shirt_blue, mat_pants_white, park_day_grp)
    create_seated_human("Person_Center_Day", 0.0, 0.5, 0.0, 180, mat_suit_navy, mat_suit_navy, park_day_grp)
    create_seated_human("Person_Right_Day", 0.9, -0.2, 0.0, -35, mat_shirt_yellow, mat_pants_white, park_day_grp)

    # Dog Day
    dog_day = bpy.data.objects.new("ParkDogDay", None)
    scene.collection.objects.link(dog_day)
    dog_day.location = (1.8, 0.3, 0.0)
    dog_day.rotation_euler = (0, 0, math.radians(-70))
    dog_day.parent = park_day_grp
    bpy.ops.mesh.primitive_cube_add(size=0.6, location=(0, 0, 0.25))
    d_body = bpy.context.active_object
    d_body.scale = (0.5, 1.2, 0.4)
    d_body.data.materials.append(mat_tree_wood)
    d_body.parent = dog_day
    bpy.ops.mesh.primitive_cube_add(size=0.35, location=(0, 0.5, 0.45))
    d_head = bpy.context.active_object
    d_head.scale = (0.7, 0.9, 0.7)
    d_head.data.materials.append(mat_tree_wood)
    d_head.parent = dog_day

    # Trees Day
    def create_tree(name, x, y, z, scale, parent, is_wireframe=False):
        t_grp = bpy.data.objects.new(name, None)
        scene.collection.objects.link(t_grp)
        t_grp.location = (x, y, z)
        t_grp.scale = (scale, scale, scale)
        t_grp.parent = parent

        bpy.ops.mesh.primitive_cylinder_add(radius=0.3, depth=3.0, location=(0, 0, 1.5))
        trunk = bpy.context.active_object
        trunk.data.materials.append(mat_tree_wood if not is_wireframe else mat_xray_edge)
        if is_wireframe:
            wf = trunk.modifiers.new(name="Wireframe", type='WIREFRAME')
            wf.thickness = 0.02
        trunk.parent = t_grp

        bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=1, radius=1.8, location=(0, 0, 3.8))
        f1 = bpy.context.active_object
        f1.data.materials.append(mat_tree_leaf if not is_wireframe else mat_xray_edge)
        if is_wireframe:
            wf1 = f1.modifiers.new(name="Wireframe", type='WIREFRAME')
            wf1.thickness = 0.02
        f1.parent = t_grp
        return t_grp

    tree_coords = [
        (-18, 25), (-14, 27), (-10, 24), (-6, 26), (-2, 25),
        (2, 25), (6, 26), (10, 24), (14, 27), (18, 25),
        (-12, 32), (-4, 33), (4, 34), (12, 33)
    ]
    for i, (tx, ty) in enumerate(tree_coords):
        create_tree(f"Tree_Day_{i}", tx, ty, 0, 0.9 + (i % 3) * 0.15, park_day_grp)

    # Skyline Day
    tower_data = [
        (-22, 55, 6, 22), (-17, 60, 5, 28), (-12, 52, 7, 34), (-7, 58, 6, 42),
        (-2, 62, 5, 38), (3, 56, 7, 45), (8, 60, 6, 36), (13, 54, 8, 26),
        (18, 58, 6, 32), (23, 64, 5, 20)
    ]
    for i, (bx, by, b_w, b_h) in enumerate(tower_data):
        bpy.ops.mesh.primitive_cube_add(size=1.0, location=(bx, by, b_h / 2.0))
        tower = bpy.context.active_object
        tower.name = f"Tower_Day_{i}"
        tower.scale = (b_w, b_w, b_h)
        tower.data.materials.append(mat_skyscrapers)
        tower.parent = park_day_grp

    # Daylight Park Group visible ONLY frames 1 - 180
    set_visibility_range(park_day_grp, 1, 180)

    # -------------------------------------------------------------
    # 2. X-RAY WIREFRAME PARK GROUP (Visible Frames 181 - 339, Scene 2)
    # -------------------------------------------------------------
    park_xray_grp = bpy.data.objects.new("ParkXRayGroup", None)
    scene.collection.objects.link(park_xray_grp)

    # Wireframe ground grid
    bpy.ops.mesh.primitive_grid_add(x_subdivisions=40, y_subdivisions=40, size=80, location=(0, 20, 0.05))
    x_ground = bpy.context.active_object
    x_ground.name = "XRayGround"
    wf_xg = x_ground.modifiers.new(name="Wireframe", type='WIREFRAME')
    wf_xg.thickness = 0.008
    x_ground.data.materials.append(mat_xray_edge)
    x_ground.parent = park_xray_grp

    # Wireframe blanket
    bpy.ops.mesh.primitive_plane_add(size=3.4, location=(0, 0, 0.06))
    x_blanket = bpy.context.active_object
    x_blanket.scale = (1.2, 0.9, 1.0)
    wf_xb = x_blanket.modifiers.new(name="Wireframe", type='WIREFRAME')
    wf_xb.thickness = 0.018
    x_blanket.data.materials.append(mat_xray_edge)
    x_blanket.parent = park_xray_grp

    create_seated_human("Person_Left_XRay", -0.9, -0.3, 0.0, 30, None, None, park_xray_grp, is_wireframe=True)
    create_seated_human("Person_Center_XRay", 0.0, 0.5, 0.0, 180, None, None, park_xray_grp, is_wireframe=True)
    create_seated_human("Person_Right_XRay", 0.9, -0.2, 0.0, -35, None, None, park_xray_grp, is_wireframe=True)

    for i, (tx, ty) in enumerate(tree_coords):
        create_tree(f"Tree_XRay_{i}", tx, ty, 0, 0.9 + (i % 3) * 0.15, park_xray_grp, is_wireframe=True)

    for i, (bx, by, b_w, b_h) in enumerate(tower_data):
        bpy.ops.mesh.primitive_cube_add(size=1.0, location=(bx, by, b_h / 2.0))
        xtower = bpy.context.active_object
        xtower.name = f"Tower_XRay_{i}"
        xtower.scale = (b_w, b_w, b_h)
        wf_xt = xtower.modifiers.new(name="Wireframe", type='WIREFRAME')
        wf_xt.thickness = 0.035
        xtower.data.materials.append(mat_xray_edge)
        xtower.parent = park_xray_grp

    # Wireframe Park Group visible ONLY frames 181 - 339
    set_visibility_range(park_xray_grp, 181, 339)

    # -------------------------------------------------------------
    # 3. 3D FLOATING ATOM (Visible Frames 1 - 180)
    # -------------------------------------------------------------
    atom_grp = bpy.data.objects.new("FloatingAtom", None)
    scene.collection.objects.link(atom_grp)
    atom_grp.location = (0, -4.5, 3.2)
    atom_grp.scale = (0.55, 0.55, 0.55)

    mat_proton = create_color_mat("ProtonMat", (0.9, 0.2, 0.2, 1.0))
    mat_neutron = create_color_mat("NeutronMat", (0.85, 0.85, 0.9, 1.0))
    nucleus_offsets = [
        (0, 0, 0, mat_proton), (0.2, 0.1, 0.15, mat_neutron),
        (-0.2, -0.1, 0.1, mat_proton), (0.1, -0.2, -0.15, mat_neutron),
        (-0.15, 0.2, -0.1, mat_proton), (0, 0, 0.25, mat_neutron)
    ]
    for nx, ny, nz, nmat in nucleus_offsets:
        bpy.ops.mesh.primitive_uv_sphere_add(radius=0.18, location=(nx, ny, nz))
        nsphere = bpy.context.active_object
        nsphere.data.materials.append(nmat)
        nsphere.parent = atom_grp

    mat_orbit = bpy.data.materials.new(name="OrbitRingMat")
    mat_orbit.use_nodes = True
    o_bsdf = mat_orbit.node_tree.nodes.get("Principled BSDF")
    o_bsdf.inputs['Base Color'].default_value = (0.7, 0.85, 1.0, 1.0)
    o_bsdf.inputs['Emission Color'].default_value = (0.7, 0.85, 1.0, 1.0)
    o_bsdf.inputs['Emission Strength'].default_value = 3.0

    for angle in [0, 60, 120]:
        bpy.ops.mesh.primitive_torus_add(major_radius=1.1, minor_radius=0.018, location=(0, 0, 0))
        ring = bpy.context.active_object
        ring.rotation_euler = (math.radians(65), math.radians(angle), 0)
        ring.data.materials.append(mat_orbit)
        ring.parent = atom_grp

    atom_grp.rotation_euler = (0, 0, 0)
    atom_grp.keyframe_insert(data_path="rotation_euler", frame=1)
    atom_grp.rotation_euler = (0, 0, math.radians(240))
    atom_grp.keyframe_insert(data_path="rotation_euler", frame=180)
    set_visibility_range(atom_grp, 1, 180)

    # -------------------------------------------------------------
    # 4. FIRST PERSON POV HANDS (Visible Frames 340 - 580, Scene 3)
    # -------------------------------------------------------------
    hands_grp = bpy.data.objects.new("POVHands", None)
    scene.collection.objects.link(hands_grp)
    hands_grp.location = (0, -2.0, 0.8)
    
    for side, sx in [("LeftHand", -0.42), ("RightHand", 0.42)]:
        bpy.ops.mesh.primitive_cube_add(size=0.5, location=(sx, -0.4, -0.2))
        arm = bpy.context.active_object
        arm.name = f"{side}_Arm"
        arm.scale = (0.55, 1.4, 0.45)
        arm.rotation_euler = (math.radians(35), 0, math.radians(sx * -15))
        wf = arm.modifiers.new(name="Wireframe", type='WIREFRAME')
        wf.thickness = 0.02
        arm.data.materials.append(mat_xray_edge)
        arm.parent = hands_grp

        bpy.ops.mesh.primitive_cube_add(size=0.4, location=(sx, 0.35, 0.15))
        palm = bpy.context.active_object
        palm.name = f"{side}_Palm"
        palm.scale = (0.75, 0.75, 0.25)
        wf_p = palm.modifiers.new(name="Wireframe", type='WIREFRAME')
        wf_p.thickness = 0.02
        palm.data.materials.append(mat_xray_edge)
        palm.parent = hands_grp

        for fi, fx in enumerate([-0.12, -0.04, 0.04, 0.12]):
            bpy.ops.mesh.primitive_cube_add(size=0.25, location=(sx + fx, 0.65, 0.18 + fi * 0.01))
            finger = bpy.context.active_object
            finger.scale = (0.28, 0.75, 0.25)
            wf_f = finger.modifiers.new(name="Wireframe", type='WIREFRAME')
            wf_f.thickness = 0.015
            finger.data.materials.append(mat_xray_edge)
            finger.parent = hands_grp

    set_visibility_range(hands_grp, 340, 580)

    # -------------------------------------------------------------
    # 5. CELESTIAL SCALE: EARTH & MOON (Visible Frames 921 - 1500, Scene 5)
    # -------------------------------------------------------------
    celestial_grp = bpy.data.objects.new("CelestialScale", None)
    scene.collection.objects.link(celestial_grp)
    celestial_grp.location = (0, 0, 0)

    # Earth Sphere with atmospheric blue-white gradient
    bpy.ops.mesh.primitive_uv_sphere_add(radius=7.0, location=(0, 0, 0))
    earth = bpy.context.active_object
    earth.name = "ExpandingEarth"
    mat_earth = bpy.data.materials.new(name="ExpandingEarthMat")
    mat_earth.use_nodes = True
    e_nodes = mat_earth.node_tree.nodes
    e_emit = e_nodes.new(type='ShaderNodeEmission')
    e_emit.inputs['Color'].default_value = (0.80, 0.88, 1.0, 1.0)
    e_emit.inputs['Strength'].default_value = 2.4
    mat_earth.node_tree.links.new(e_emit.outputs['Emission'], e_nodes.get('Material Output').inputs['Surface'])
    earth.data.materials.append(mat_earth)
    earth.parent = celestial_grp

    earth.scale = (1.0, 1.0, 1.0)
    earth.keyframe_insert(data_path="scale", frame=921)
    earth.scale = (14.0, 14.0, 14.0)
    earth.keyframe_insert(data_path="scale", frame=1500)

    # Moon Sphere
    bpy.ops.mesh.primitive_uv_sphere_add(radius=1.8, location=(18.0, 12.0, 2.0))
    moon = bpy.context.active_object
    moon.name = "FlungMoon"
    mat_moon = create_color_mat("MoonMat", (0.28, 0.28, 0.30, 1.0))
    moon.data.materials.append(mat_moon)
    moon.parent = celestial_grp

    moon.location = (18.0, 12.0, 2.0)
    moon.keyframe_insert(data_path="location", frame=921)
    moon.location = (45.0, 40.0, 15.0)
    moon.keyframe_insert(data_path="location", frame=1500)

    set_visibility_range(celestial_grp, 921, 1500)

    # -------------------------------------------------------------
    # 6. LIDAR POINT CLOUD CENTRAL PARK (Visible Frames 1501 - 1800, Scene 6)
    # -------------------------------------------------------------
    lidar_grp = bpy.data.objects.new("LidarPointCloud", None)
    scene.collection.objects.link(lidar_grp)
    lidar_grp.location = (0, 0, 0)

    bpy.ops.mesh.primitive_grid_add(x_subdivisions=50, y_subdivisions=50, size=60, location=(0, 25, 0.1))
    l_grid = bpy.context.active_object
    l_grid.name = "LidarGround"
    wf_g = l_grid.modifiers.new(name="Wireframe", type='WIREFRAME')
    wf_g.thickness = 0.012
    l_grid.data.materials.append(mat_lidar)
    l_grid.parent = lidar_grp

    # Ghostly LiDAR seated figures
    create_seated_human("Person_Left_Lidar", -0.9, -0.3, 0.0, 30, None, None, lidar_grp, is_wireframe=True)
    create_seated_human("Person_Center_Lidar", 0.0, 0.5, 0.0, 180, None, None, lidar_grp, is_wireframe=True)
    create_seated_human("Person_Right_Lidar", 0.9, -0.2, 0.0, -35, None, None, lidar_grp, is_wireframe=True)

    for i, (bx, by, b_w, b_h) in enumerate(tower_data):
        bpy.ops.mesh.primitive_cube_add(size=1.0, location=(bx, by, b_h / 2.0))
        ltower = bpy.context.active_object
        ltower.name = f"LidarTower_{i}"
        ltower.scale = (b_w, b_w, b_h)
        wf_t = ltower.modifiers.new(name="Wireframe", type='WIREFRAME')
        wf_t.thickness = 0.04
        ltower.data.materials.append(mat_lidar)
        ltower.parent = lidar_grp

    set_visibility_range(lidar_grp, 1501, 1800)

    bpy.ops.wm.save_as_mainfile(filepath=save_path)
    print(f"Master Blender project saved to: {save_path}")

if __name__ == "__main__":
    setup_blender_project()

