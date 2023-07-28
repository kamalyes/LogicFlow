import Engine, { TaskNode } from '../src/index';

describe('@logicflow/engine parallel and serial', () => {
  class FetchNode extends TaskNode {
    async action() {
      await this.fetch()
    }
    fetch() {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve()
        }, 100);
      })
    }
  }
  const engine = new Engine();
  engine.register({
    type: 'FetchTask',
    model: FetchNode,
  })
  const flowData = {
    graphData: {
      nodes: [
        {
          id: 'node1',
          type: 'StartNode',
          properties: {
          }
        },
        {
          id: 'node2',
          type: 'FetchTask',
          properties: {}
        },
        {
          id: 'node3',
          type: 'TaskNode',
          properties: {}
        },
        {
          id: 'node4',
          type: 'TaskNode',
          properties: {}
        }
      ],
      edges: [
        {
          id: 'edge1',
          sourceNodeId: 'node1',
          targetNodeId: 'node2',
          properties: {
          }
        },
        {
          id: 'edge2',
          sourceNodeId: 'node1',
          targetNodeId: 'node3',
          properties: {
          }
        },
        {
          id: 'edge3',
          sourceNodeId: 'node3',
          targetNodeId: 'node4',
          properties: {
          }
        }
      ]
    },
    globalData: {
    },
  }
  engine.load(flowData);
  test('When the process is executed, the asynchronous node will not block the execution of other branch nodes.', async () => {
    const result = await engine.execute();
    const execution = await engine.getExecutionRecord(result.executionId);
    expect(execution.length).toBe(4);
    expect(execution[3].nodeId).toEqual('node2')
  });
  test('When the process is executed twice, the second execution will start only after the first execution is completed.', async () => {
    const r = engine.execute();
    const r2 = engine.execute();
    const result = await Promise.all([r, r2]);
    const execution1 = await engine.getExecutionRecord(result[0].executionId);
    const execution2 = await engine.getExecutionRecord(result[1].executionId);
    expect(execution2[0].timestamp >= execution1[3].timestamp).toBe(true)
  });
})