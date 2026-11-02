import test from 'node:test';
import assert from 'node:assert';
import { UXGraphEngine, UXNode, UXEdge } from './ux-graph-engine.js';

test('UXGraphEngine — 1. Adição e recuperação de nós e arestas com validação', () => {
  const graph = new UXGraphEngine();

  const node1: UXNode = { id: 'token:color.primary', type: 'token', label: 'Color Primary' };
  const node2: UXNode = { id: 'comp:Button', type: 'component', label: 'Primary Button' };

  graph.addNode(node1);
  graph.addNode(node2);

  assert.strictEqual(graph.hasNode('token:color.primary'), true);
  assert.strictEqual(graph.hasNode('comp:Button'), true);
  assert.strictEqual(graph.hasNode('inexistente'), false);
  assert.strictEqual(graph.getAllNodes().length, 2);

  const edge: UXEdge = {
    source: 'comp:Button',
    target: 'token:color.primary',
    type: 'uses_token',
    provenance: 'EXTRACTED',
    confidence: 1.0
  };

  graph.addEdge(edge);

  assert.strictEqual(graph.getEdges().length, 1);
  assert.strictEqual(graph.getOutgoingEdges('comp:Button').length, 1);
  assert.strictEqual(graph.getIncomingEdges('token:color.primary').length, 1);

  // Validação: adicionar aresta com nó inexistente deve falhar
  assert.throws(() => {
    graph.addEdge({
      source: 'nao-existe',
      target: 'token:color.primary',
      type: 'uses_token',
      provenance: 'EXTRACTED',
      confidence: 1.0
    });
  }, /Nó de origem/);
});

test('UXGraphEngine — 2. Ingestão determinística de W3C DTCG Tokens', () => {
  const graph = new UXGraphEngine();

  const dtcgSample = {
    color: {
      brand: {
        primary: {
          $value: '#2563EB',
          $type: 'color',
          $description: 'Cor primária institucional'
        },
        secondary: {
          $value: '#475569',
          $type: 'color'
        }
      }
    },
    spacing: {
      base: {
        $value: '8px',
        $type: 'dimension'
      }
    }
  };

  const count = graph.ingestTokensFromDTCG(dtcgSample, 'templates/tokens-starter.json');
  assert.strictEqual(count, 3);
  assert.strictEqual(graph.getNodesByType('token').length, 3);

  const primaryToken = graph.getNode('token:color.brand.primary');
  assert.ok(primaryToken);
  assert.strictEqual(primaryToken.metadata?.value, '#2563EB');
  assert.strictEqual(primaryToken.metadata?.type, 'color');
});

test('UXGraphEngine — 3. Cálculo de Blast Radius (Raio de Impacto e propagação downstream)', () => {
  const graph = new UXGraphEngine();

  // Cria hierarquia: Token -> 3 Componentes -> 4 Telas -> 1 Persona
  graph.addNode({ id: 'token:primary', type: 'token', label: 'Primary Color' });

  graph.addNode({ id: 'comp:Button', type: 'component', label: 'Button' });
  graph.addNode({ id: 'comp:Badge', type: 'component', label: 'Badge' });
  graph.addNode({ id: 'comp:Header', type: 'component', label: 'Header' });

  graph.addNode({ id: 'screen:Home', type: 'screen', label: 'Home Screen' });
  graph.addNode({ id: 'screen:Checkout', type: 'screen', label: 'Checkout Screen' });
  graph.addNode({ id: 'screen:Profile', type: 'screen', label: 'Profile Screen' });
  graph.addNode({ id: 'screen:Settings', type: 'screen', label: 'Settings Screen' });

  graph.addNode({ id: 'persona:Buyer', type: 'persona', label: 'End Buyer' });

  // Arestas: Component uses_token Token
  graph.addEdge({ source: 'comp:Button', target: 'token:primary', type: 'uses_token', provenance: 'EXTRACTED', confidence: 1.0 });
  graph.addEdge({ source: 'comp:Badge', target: 'token:primary', type: 'uses_token', provenance: 'EXTRACTED', confidence: 1.0 });
  graph.addEdge({ source: 'comp:Header', target: 'token:primary', type: 'uses_token', provenance: 'EXTRACTED', confidence: 1.0 });

  // Arestas: Screen composes_component Component
  graph.addEdge({ source: 'screen:Home', target: 'comp:Header', type: 'composes_component', provenance: 'EXTRACTED', confidence: 1.0 });
  graph.addEdge({ source: 'screen:Checkout', target: 'comp:Button', type: 'composes_component', provenance: 'EXTRACTED', confidence: 1.0 });
  graph.addEdge({ source: 'screen:Checkout', target: 'comp:Badge', type: 'composes_component', provenance: 'EXTRACTED', confidence: 1.0 });
  graph.addEdge({ source: 'screen:Profile', target: 'comp:Button', type: 'composes_component', provenance: 'EXTRACTED', confidence: 1.0 });
  graph.addEdge({ source: 'screen:Settings', target: 'comp:Button', type: 'composes_component', provenance: 'EXTRACTED', confidence: 1.0 });

  // Arestas: Screen impacts_persona Persona
  graph.addEdge({ source: 'screen:Checkout', target: 'persona:Buyer', type: 'impacts_persona', provenance: 'INFERRED', confidence: 0.85 });

  const blast = graph.calculateBlastRadius('token:primary', 5);

  assert.strictEqual(blast.targetId, 'token:primary');
  assert.strictEqual(blast.directDependents.length, 3); // Button, Badge, Header
  // 3 components + 4 screens + 1 persona = 8 nós impactados
  assert.strictEqual(blast.totalImpactedCount, 8);
  assert.strictEqual(blast.isHighRisk, true); // 8 > threshold 5
  assert.strictEqual(blast.impactedByType.component.length, 3);
  assert.strictEqual(blast.impactedByType.screen.length, 4);
  assert.strictEqual(blast.impactedByType.persona.length, 1);
  assert.strictEqual(blast.depthMap['comp:Button'], 1);
  assert.strictEqual(blast.depthMap['screen:Checkout'], 2);
  assert.strictEqual(blast.depthMap['persona:Buyer'], 3);
});

test('UXGraphEngine — 4. Menor Caminho (Shortest Path BFS)', () => {
  const graph = new UXGraphEngine();

  graph.addNode({ id: 'token:color', type: 'token', label: 'Color' });
  graph.addNode({ id: 'comp:Button', type: 'component', label: 'Button' });
  graph.addNode({ id: 'screen:Cart', type: 'screen', label: 'Cart Screen' });
  graph.addNode({ id: 'screen:Payment', type: 'screen', label: 'Payment Screen' });
  graph.addNode({ id: 'isolated:node', type: 'component', label: 'Isolated' });

  graph.addEdge({ source: 'comp:Button', target: 'token:color', type: 'uses_token', provenance: 'EXTRACTED', confidence: 1.0 });
  graph.addEdge({ source: 'screen:Cart', target: 'comp:Button', type: 'composes_component', provenance: 'EXTRACTED', confidence: 1.0 });
  graph.addEdge({ source: 'screen:Cart', target: 'screen:Payment', type: 'navigates_to', provenance: 'EXTRACTED', confidence: 1.0 });

  const path = graph.findShortestPath('token:color', 'screen:Payment');
  assert.ok(path);
  assert.deepStrictEqual(path, ['token:color', 'comp:Button', 'screen:Cart', 'screen:Payment']);

  // Caminho para o mesmo nó
  assert.deepStrictEqual(graph.findShortestPath('token:color', 'token:color'), ['token:color']);

  // Caminho inexistente
  assert.strictEqual(graph.findShortestPath('token:color', 'isolated:node'), null);
});

test('UXGraphEngine — 5. Extração de Subgrafo para montagem cirúrgica de contexto (Pruning)', () => {
  const graph = new UXGraphEngine();

  graph.addNode({ id: 'center:Modal', type: 'component', label: 'Modal' });
  graph.addNode({ id: 'child:CloseButton', type: 'component', label: 'CloseButton' });
  graph.addNode({ id: 'token:radius', type: 'token', label: 'Radius' });
  graph.addNode({ id: 'screen:Dashboard', type: 'screen', label: 'Dashboard' });
  graph.addNode({ id: 'distant:Unrelated', type: 'component', label: 'Unrelated' });

  graph.addEdge({ source: 'center:Modal', target: 'token:radius', type: 'uses_token', provenance: 'EXTRACTED', confidence: 1.0 });
  graph.addEdge({ source: 'center:Modal', target: 'child:CloseButton', type: 'composes_component', provenance: 'EXTRACTED', confidence: 1.0 });
  graph.addEdge({ source: 'screen:Dashboard', target: 'center:Modal', type: 'composes_component', provenance: 'EXTRACTED', confidence: 1.0 });

  const sub = graph.getSubGraph('center:Modal', 1);

  const subNodeIds = sub.nodes.map(n => n.id);
  assert.ok(subNodeIds.includes('center:Modal'));
  assert.ok(subNodeIds.includes('token:radius'));
  assert.ok(subNodeIds.includes('child:CloseButton'));
  assert.ok(subNodeIds.includes('screen:Dashboard'));
  assert.strictEqual(subNodeIds.includes('distant:Unrelated'), false);
  assert.strictEqual(sub.edges.length, 3);
});

test('UXGraphEngine — 6. Detecção de God Components e Nós Órfãos', () => {
  const graph = new UXGraphEngine();

  // God Component: Button conectado a 5 coisas
  graph.addNode({ id: 'comp:GodButton', type: 'component', label: 'GodButton' });
  graph.addNode({ id: 'token:c1', type: 'token', label: 'Color 1' });
  graph.addNode({ id: 'token:c2', type: 'token', label: 'Color 2' });
  graph.addNode({ id: 'token:c3', type: 'token', label: 'Color 3' });
  graph.addNode({ id: 'screen:S1', type: 'screen', label: 'Screen 1' });
  graph.addNode({ id: 'screen:S2', type: 'screen', label: 'Screen 2' });

  // Nós órfãos
  graph.addNode({ id: 'token:zombie', type: 'token', label: 'Zombie Token' });
  graph.addNode({ id: 'comp:orphan', type: 'component', label: 'Orphan Component' });
  graph.addNode({ id: 'screen:orphan', type: 'screen', label: 'Orphan Screen' });

  graph.addEdge({ source: 'comp:GodButton', target: 'token:c1', type: 'uses_token', provenance: 'EXTRACTED', confidence: 1.0 });
  graph.addEdge({ source: 'comp:GodButton', target: 'token:c2', type: 'uses_token', provenance: 'EXTRACTED', confidence: 1.0 });
  graph.addEdge({ source: 'comp:GodButton', target: 'token:c3', type: 'uses_token', provenance: 'EXTRACTED', confidence: 1.0 });
  graph.addEdge({ source: 'screen:S1', target: 'comp:GodButton', type: 'composes_component', provenance: 'EXTRACTED', confidence: 1.0 });
  graph.addEdge({ source: 'screen:S2', target: 'comp:GodButton', type: 'composes_component', provenance: 'EXTRACTED', confidence: 1.0 });

  const godList = graph.findGodComponents(4);
  assert.strictEqual(godList.length, 1);
  assert.strictEqual(godList[0].node.id, 'comp:GodButton');
  assert.strictEqual(godList[0].totalDegree, 5);

  const orphans = graph.findOrphanNodes();
  assert.strictEqual(orphans.orphanTokens.some(t => t.id === 'token:zombie'), true);
  assert.strictEqual(orphans.orphanComponents.some(c => c.id === 'comp:orphan'), true);
  assert.strictEqual(orphans.orphanScreens.some(s => s.id === 'screen:orphan'), true);
});

test('UXGraphEngine — 7. Serialização Snapshot e Reconstituição (fromSnapshot)', () => {
  const graph = new UXGraphEngine();
  graph.addNode({ id: 't1', type: 'token', label: 'Token 1' });
  graph.addNode({ id: 'c1', type: 'component', label: 'Component 1' });
  graph.addEdge({ source: 'c1', target: 't1', type: 'uses_token', provenance: 'EXTRACTED', confidence: 1.0 });

  const snapshot = graph.toSnapshot();
  assert.strictEqual(snapshot.version, '1.0.0');
  assert.strictEqual(snapshot.stats.totalNodes, 2);
  assert.strictEqual(snapshot.stats.totalEdges, 1);
  assert.strictEqual(snapshot.stats.byProvenance.EXTRACTED, 1);

  const reconstructed = UXGraphEngine.fromSnapshot(snapshot);
  assert.strictEqual(reconstructed.getAllNodes().length, 2);
  assert.strictEqual(reconstructed.getEdges().length, 1);
  assert.strictEqual(reconstructed.hasNode('t1'), true);
});
