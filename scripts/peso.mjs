import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { MeshoptDecoder } from 'meshoptimizer';
await MeshoptDecoder.ready;
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ 'meshopt.decoder': MeshoptDecoder });
for (const f of process.argv.slice(2)) {
  const d = await io.read(f); const r = d.getRoot();
  const tex = r.listTextures(); const tb = tex.reduce((a, t) => a + t.getImage().byteLength, 0);
  console.log(f, 'texturas:', tex.length, (tb/1024|0)+'KB', tex.slice(0,3).map(t=>t.getSize()?.join('x')).join(','), 'mallas:', r.listMeshes().length, 'nodos:', r.listNodes().length);
}
