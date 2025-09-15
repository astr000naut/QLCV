const { faker } = require('@faker-js/faker');

const generateUsers = (count) => {
  const users = [];
  for (let i = 1; i <= count; i++) {
    users.push({
      id: i,
      name: faker.person.fullName(),
      email: faker.internet.email(),
      password: 'password123',
      role_id: faker.helpers.arrayElement([1, 2, 3]), // 1: Admin, 2: Editor, 3: Viewer
      createdAt: faker.date.past().toISOString(),
    });
  }
  return users;
};

const generateFolders = (count) => {
    const folders = [];
    for (let i = 1; i <= count; i++) {
        folders.push({
            id: i,
            name: faker.lorem.words(3),
            parentId: null,
            children: []
        });
    }

    // Create some nested structure
    if (count > 2) {
        folders[1].parentId = folders[0].id;
        folders[0].children.push(folders[1]);
    }
     if (count > 3) {
        folders[2].parentId = folders[0].id;
        folders[0].children.push(folders[2]);
    }

    return folders.filter(f => f.parentId === null); // Return only root folders
};


const generateDocuments = (count, users, folders) => {
    const documents = [];
    const flatFolders = folders.flatMap(f => [f, ...f.children]);

    for (let i = 1; i <= count; i++) {
        const uploader = faker.helpers.arrayElement(users);
        const folder = faker.helpers.arrayElement(flatFolders);
        const status = faker.helpers.arrayElement(['pending', 'approved', 'rejected']);

        documents.push({
            id: 100 + i,
            name: faker.lorem.sentence(4),
            description: faker.lorem.paragraph(),
            status: status,
            fileUrl: `http://localhost:9000/documents/sample-${i}.pdf`,
            uploader: {
                id: uploader.id,
                name: uploader.name,
            },
            uploadedAt: faker.date.recent().toISOString(),
            folderId: folder.id,
            history: [
                { action: 'Uploaded', user: uploader.name, timestamp: faker.date.past().toISOString() },
                ...(status !== 'pending' ? [{ action: faker.helpers.arrayElement(['Approved', 'Rejected']), user: 'Admin', timestamp: faker.date.recent().toISOString() }] : [])
            ]
        });
    }
    return documents;
};

const generateTasks = (count, users, documents) => {
  const tasks = [];
  for (let i = 1; i <= count; i++) {
    const creator = faker.helpers.arrayElement(users);
    const assignee = faker.helpers.arrayElement(users);
    const approverCount = faker.number.int({ min: 1, max: 3 });
    const approvers = Array.from({ length: approverCount }, () => faker.helpers.arrayElement(users))
      .map(u => u.id);
    const docCount = faker.number.int({ min: 1, max: 3 });
    const attachedDocs = Array.from({ length: docCount }, () => faker.helpers.arrayElement(documents))
      .map(d => d.id);
    const status = faker.helpers.arrayElement(['open', 'in_progress', 'awaiting_approval', 'approved', 'rejected']);
    tasks.push({
      id: 1000 + i,
      name: faker.lorem.sentence(4),
      description: faker.lorem.paragraph(),
      status,
      assigneeId: assignee.id,
      approverIds: Array.from(new Set(approvers)),
      documentIds: Array.from(new Set(attachedDocs)),
      dueDate: faker.date.soon().toISOString(),
      createdBy: creator.id,
      createdAt: faker.date.recent().toISOString(),
    });
  }
  return tasks;
};

const { PERMISSIONS } = require('../constants/permissions');

const generatePermissions = () => PERMISSIONS;

const generateRoles = () => {
    return [
        { 
            id: 1, 
            name: 'Admin', 
            description: 'Quản trị viên hệ thống', 
            permissions: [
                "reports:overview",
                "reports:performance",
                "reports:count",
                "documents:list",
                "documents:upload",
                "documents:edit",
                "documents:approve",
                "documents:delete",
                "admin:users:manage",
                "admin:settings"
            ] 
        },
        { 
            id: 2, 
            name: 'Editor', 
            description: 'Biên tập viên có quyền chỉnh sửa tài liệu', 
            permissions: [
                "documents:list",
                "documents:upload",
                "documents:edit"
            ] 
        },
        { 
            id: 3, 
            name: 'Viewer', 
            description: 'Người chỉ có quyền xem', 
            permissions: ["documents:list"] 
        },
    ];
};


const users = generateUsers(25);
const folders = generateFolders(5);
const documents = generateDocuments(150, users, folders);
const permissions = generatePermissions();
const roles = generateRoles();
const tasks = generateTasks(25, users, documents);

// Add a specific user for login testing
users.push({
    id: 99,
    name: 'Văn A',
    email: 'user@example.com',
    password: 'password123',
    role_id: 1, // Admin
    createdAt: new Date().toISOString()
});


module.exports = {
  users,
  folders,
  documents,
  roles,
  permissions,
  tasks,
};
