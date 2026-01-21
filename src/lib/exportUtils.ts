import { ProcessModel } from "./types";

export function generateMermaidCode(model: ProcessModel): string {
    let mermaid = 'graph TD\n';

    // Add styling class
    mermaid += '    classDef default fill:#f9f9f9,stroke:#333,stroke-width:2px;\n';
    mermaid += '    classDef decision fill:#fff2cc,stroke:#d6b656,stroke-width:2px;\n';
    mermaid += '    classDef term fill:#d5e8d4,stroke:#82b366,stroke-width:2px;\n';

    model.steps.forEach(step => {
        // Sanitize ID and label
        const id = step.id.replace(/[^a-zA-Z0-9]/g, '_');
        const label = step.description.replace(/"/g, "'");

        let shapeOpen = '[';
        let shapeClose = ']';
        let className = 'default';

        switch (step.type) {
            case 'start':
            case 'end':
                shapeOpen = '([';
                shapeClose = '])';
                className = 'term';
                break;
            case 'decision':
                shapeOpen = '{';
                shapeClose = '}';
                className = 'decision';
                break;
            case 'action':
            default:
                shapeOpen = '[';
                shapeClose = ']';
                break;
        }

        mermaid += `    ${id}${shapeOpen}"${label}"${shapeClose}:::${className}\n`;

        if (step.next && step.next.length > 0) {
            step.next.forEach(nextId => {
                const safeNextId = nextId.replace(/[^a-zA-Z0-9]/g, '_');
                mermaid += `    ${id} --> ${safeNextId}\n`;
            });
        }
    });

    return mermaid;
}
