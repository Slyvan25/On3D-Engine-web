# On3D-Engine-web
An implementation of the qpang game engine but for web remade for modding and such.

This project is a high-level facade for the web-based On3D engine.
Our goal is to reverse engineer the On3D engine and provide a high-level API for developers to use. We aim to make it easy for developers to create 3D games and applications using the On3D engine. We also aim to provide a simple and intuitive API that is easy to learn and use. We strive to provide a seamless integration with the On3D engine, allowing developers to focus on their game logic rather than low-level details. We also aim to provide a comprehensive documentation and support system to help developers get started quickly and easily. We are committed to providing a high-quality and reliable service to our users, and we strive to meet their needs and exceed their expectations. We are dedicated to providing a user-friendly and intuitive interface that makes it easy for developers to create stunning 3D games and applications using the On3D engine. We are committed to providing ongoing support and updates to ensure that our users have access to the latest features and improvements. We are passionate about creating a community of developers who can work together to build amazing 3D games and applications using the On3D engine. We are excited to be a part of the On3D community and look forward to working with you to create amazing 3D games and applications.

## Getting Started

To get started with the On3D engine, you can follow these steps:

1. Install the On3D engine by running `deno install on3d`.
2. Create a new project by running `on3d init`.
3. Start the development server by running `on3d start`.
4. Build your project by running `on3d build`.
5. Deploy your project by running `on3d deploy`.
6. Test your project by running `on3d test`.
7. Debug your project by running `on3d debug`.
8. Publish your project by running `on3d publish`.
9. Share your project by running `on3d share`.
10. Collaborate with others by running `on3d collaborate`.
11. Contribute to the On3D engine by running `on3d contribute`.
12. Learn more about the On3D engine by running `on3d learn`.


## Todo
- ✅ engine renderer ( replace dx9 calls with threejs/webgpu calls)
- ✅ implement the original calls for the engine.
- ✅ reimplement the dependencies in typescript.
- Implement a pack reader so that we are able to import older projects back in to the engine
- Implement a way to read the original game files in the pack file and transform them in to threejs or webgpu calls.
- replace the original networking library with a better one
- implement lua scripting.


## Documentation

#Structure

```
WEB-ON3D ENGINE/
│  index.html
│  deno.json
│  import_map.json
│
└─ src/
   ├─ game/
   │   main.ts
   │   game-scene.ts
   │   camera-controller.ts
   │   character-controller.ts
   │
   ├─ engine/
   │   engine.ts
   │   types.ts
   │
   │   ├─ core/
   │   │    math.ts
   │   │    transform.ts
   │   │    events.ts
   │
   │   ├─ scene/
   │   │    scene-manager.ts
   │   │    scene-node.ts
   │   │    camera.ts
   │   │    viewport.ts
   │
   │   ├─ render/
   │   │    three-renderer.ts
   │   │    render-system.ts
   │
   │   ├─ avatar/
   │   │    avatar.ts
   │   │    animation.ts
   │   │    sockets.ts
   │
   │   ├─ resource/
   │   │    pack-reader.ts
   │   │    resource-manager.ts
   │   │
   │   │   ├─ loaders/
   │   │   │     mesh-loader.ts
   │   │   │     material-loader.ts
   │   │   │     scene-loader.ts
   │   │   │     collision-loader.ts
   │   │
   │   │   ├─ builders/
   │   │         mesh-builder.ts
   │   │         material-builder.ts
   │   │         scene-builder.ts
   │   │         collision-builder.ts
   │
   │   ├─ game/   #not the runtime but important game scripts!!!
   │         game-scene.ts
   │         game-avatar.ts
   │
   └── assets/
       └── packs/
           data.pack

```

#API

#Examples

#Troubleshooting

#Contributing

#License

#Support

#Community
