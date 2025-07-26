export const syncTables = [
	{
		name: 'tjobs',
		primaryKey: 'id',
		endpoint: '/jobs',
		columns: {
			id: 'INTEGER PRIMARY KEY',
			title: 'TEXT',
			description: 'TEXT',
			synced: 'INTEGER DEFAULT 0',
		},
	},
	{
		name: 'users',
		primaryKey: 'id',
		endpoint: '/users',
		columns: {
			id: 'INTEGER PRIMARY KEY',
			name: 'TEXT',
			email: 'TEXT',
			synced: 'INTEGER DEFAULT 0',
		},
	},
	{
		name: 'attachments',
		primaryKey: 'file_id',
		endpoint: '/attachments',
		columns: {
			file_id: 'INTEGER PRIMARY KEY',
			job_id: 'INTEGER',
			filename: 'TEXT',
			synced: 'INTEGER DEFAULT 0',
		},
	},
	// Add more as needed
];
