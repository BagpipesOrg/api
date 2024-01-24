
//

interface ChainNode {
  id: string;
  type: string;
  position: {
    x: number;
    y: number;
  };
  data: {
    label: string;
    image: string;
    name: string;
  };
  style: Record<string, unknown>; // Adjust the type as needed
  formData: {
    chain: string;
    asset: {
      name: string;
      assetId: number;
      symbol: string;
    };
    address: string;
    amount: string;
    delay: null | unknown; // Adjust the type as needed
    contact: null | unknown; // Adjust the type as needed
  };
  width: number;
  height: number;
  selected: boolean;
  positionAbsolute: {
    x: number;
    y: number;
  };
  dragging: boolean;
}




export function validateDiagramData(diagramData: any): any { //DiagramData
    console.log('Inside validateDiagramData');
    console.log('Nodes:', diagramData.nodes);
  //  console.log('Edges:', diagramData.edges);
  
    // Check if there are multiple starting nodes
    const startingNodes = diagramData.nodes.filter(
      (node) => !diagramData.edges.find((edge) => edge.target === node.id)
    );
  
    if (startingNodes.length > 1) {
      throw new Error(
        "There are multiple starting nodes. Please make sure there's only one starting point in the diagram."
      );
    }
  
    // Check for multiple ending nodes
    const endingNodes = diagramData.nodes.filter(
      (node) => !diagramData.edges.find((edge) => edge.source === node.id)
    );
  
    if (endingNodes.length > 1) {
      throw new Error(
        "There are multiple ending nodes. Please make sure there's only one ending point in the diagram."
      );
    }
  
    // TODO: check for circular references (This will need a more advanced algorithm)
  
    // TODO: check for multiple paths (Another advanced algorithm)
  
    // Ensure action nodes are not at the start or end
    if (startingNodes[0]?.type === 'action' || endingNodes[0]?.type === 'action') {
        throw new Error(`Scenarios cannot start or end with an action node.`);

    }
  
    // Ensure that chain nodes or action nodes are not connected directly
    diagramData.edges.forEach((edge) => {
      const sourceType = diagramData.nodes.find((node) => node.id === edge.source)?.type;
      const targetType = diagramData.nodes.find((node) => node.id === edge.target)?.type;
  
      if ((sourceType === 'chain' && targetType === 'chain') || (sourceType === 'action' && targetType === 'action')) {
    
        throw new Error(
          "Chain nodes or action nodes are connected to each other directly. They should be connected as ChainNode > ActionNode > ChainNode."
        );
      }
    });
  
    // Additional validation checks can go here
  
    // Return diagramData if no issues found
    return diagramData;
  }