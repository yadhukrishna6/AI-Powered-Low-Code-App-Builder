"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    const project = await prisma.project.create({
        data: {
            name: 'Sales CRM',
            description: 'Project to manage leads and automated follow-ups.',
            status: 'Active',
            thumbnailColor: '#4f46e5',
        },
    });
    const form = await prisma.form.create({
        data: {
            projectId: project.id,
            name: 'Lead Intake Form',
            schema: {
                fields: [
                    { id: 'name', type: 'text', label: 'Full Name', required: true },
                    { id: 'email', type: 'email', label: 'Email Address', required: true },
                    { id: 'company', type: 'text', label: 'Company Name', required: false },
                ],
            },
        },
    });
    const workflow = await prisma.workflow.create({
        data: {
            projectId: project.id,
            name: 'Auto-Responder Workflow',
            description: 'Sends an email whenever a new lead submits the intake form.',
            status: 'active',
            draftGraph: {
                nodes: [
                    {
                        id: 'node-1',
                        type: 'trigger',
                        subType: 'form-trigger',
                        position: { x: 100, y: 100 },
                        data: { formId: form.id },
                    },
                    {
                        id: 'node-2',
                        type: 'action',
                        subType: 'send-email',
                        position: { x: 400, y: 100 },
                        data: {
                            to: '{{email}}',
                            subject: 'Thank you for your interest!',
                            body: 'Hi {{name}}, we received your request for {{company}}.',
                        },
                    },
                    {
                        id: 'node-3',
                        type: 'system',
                        subType: 'end',
                        position: { x: 700, y: 100 },
                    },
                ],
                edges: [
                    { id: 'edge-1', source: 'node-1', target: 'node-2' },
                    { id: 'edge-2', source: 'node-2', target: 'node-3' },
                ],
            },
        },
    });
    await prisma.workflowVersion.create({
        data: {
            workflowId: workflow.id,
            version: 1,
            graph: workflow.draftGraph,
            metadata: { notes: 'Initial automated flow' },
        },
    });
    console.log('Seed data created successfully:');
    console.log(`- Project: ${project.name}`);
    console.log(`- Form: ${form.name}`);
    console.log(`- Workflow: ${workflow.name}`);
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map