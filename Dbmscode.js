// seedDBMS.js — Run this script once to populate DBMS interview questions
// Usage: node seedDBMS.js
// Make sure your .env has MONGODB_URI set

const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI;

// ─── Schema ──────────────────────────────────────────────────────────────────
const DBMSQuestionSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  level: { type: String, enum: ['basic', 'intermediate', 'advanced'], required: true },
  topic: { type: String, required: true },
  question: { type: String, required: true },
  answer: { type: String, required: true },
  tags: [{ type: String }],
  createdAt: { type: Date, default: Date.now }
});

const DBMSQuestion = mongoose.model('DBMSQuestion', DBMSQuestionSchema);

// ─── Data ─────────────────────────────────────────────────────────────────────
const dbmsQuestions = [
  {
    id: 1, level: "basic", topic: "Normalization",
    question: "What are the different types of normalization in DBMS, and explain them?",
    answer: "There are four types of normalization in DBMS: 1NF, 2NF, 3NF, and BCNF.\n\n1NF: A relation is in First Normal Form if each cell contains only atomic values. Each attribute should have a single value or NULL. The objective is to remove duplicate columns.\n\n2NF: A relation is in 2NF if it is in 1NF and no partial dependency exists between relationships.\n\n3NF: A relation is in Third Normal Form if it is in 2NF and no transitive dependency exists for non-prime attributes. A → B is a transitive dependency if A is not a super key and B is a non-prime attribute.\n\nBCNF (Boyce-Codd Normal Form): A relation is in BCNF if it is in 3NF and for all non-trivial functional dependencies A → B, A is the super key of the relation.",
    tags: ["normalization", "1NF", "2NF", "3NF", "BCNF"]
  },
  {
    id: 2, level: "basic", topic: "RDBMS",
    question: "What is RDBMS? Differentiate between RDBMS and DBMS.",
    answer: "RDBMS stands for Relational Database Management System. It accesses data based on standard fields between tables.\n\nThe primary difference: DBMS stores data in the form of files, while RDBMS stores data in the form of tables.",
    tags: ["RDBMS", "DBMS", "difference"]
  },
  {
    id: 3, level: "basic", topic: "SQL Commands",
    question: "What is the difference between the DROP command, TRUNCATE command, and DELETE command?",
    answer: "TRUNCATE and DROP are both DDL commands used to delete database tables. Once deleted, they cannot be rolled back. Indexes also get deleted.\n\nDELETE is a DML command used to delete rows or columns from a table, and it can be rolled back.",
    tags: ["DROP", "TRUNCATE", "DELETE", "DDL", "DML"]
  },
  {
    id: 4, level: "basic", topic: "Entity",
    question: "What is an Entity, Entity Type, and Entity Set in DBMS?",
    answer: "Entity: A thing that can exist independently and is distinguishable from other objects.\n\nEntity Type: Refers to the category to which an Entity belongs.\n\nEntity Set: A collection or set of all entities of a particular entity type at any point in time.",
    tags: ["entity", "entity type", "entity set"]
  },
  {
    id: 5, level: "basic", topic: "DBMS Advantages",
    question: "What are the advantages of DBMS over traditional File-based Systems?",
    answer: "Key advantages: No unauthorized access to data, Easy retrieval, Atomicity of data (multiple operations grouped into a single logical entity), Easy accessibility and processing of data, Redundancy control, Integrity check.",
    tags: ["advantages", "file system", "DBMS"]
  },
  {
    id: 6, level: "basic", topic: "Keys",
    question: "Explain the term 'key' and its different types in DBMS.",
    answer: "A key is a set of attributes that identifies each tuple uniquely.\n\nSuper Key: Identifies each tuple uniquely; can have any number of attributes.\nCandidate Key: Minimal set of attributes that can uniquely define a tuple.\nPrimary Key: Candidate key selected during design; must be unique, no NULL.\nAlternate Key: Unused candidate keys after selecting the primary key.\nForeign Key: Attribute whose values depend on another table's primary key values.\nComposite Key: Primary key consisting of more than one attribute.",
    tags: ["keys", "primary key", "foreign key", "candidate key", "super key", "composite key"]
  },
  {
    id: 7, level: "basic", topic: "SQL",
    question: "What do you mean by the term 'Join'?",
    answer: "Join is a SQL clause used to combine rows from two or more tables that share standard fields between them.",
    tags: ["join", "SQL"]
  },
  {
    id: 8, level: "basic", topic: "Subquery",
    question: "What do you mean by a correlated subquery in DBMS?",
    answer: "A subquery is a nested query — a query written inside another query. When a subquery is executed for each row of the outer query, it is called a correlated subquery.",
    tags: ["subquery", "correlated subquery", "nested query"]
  },
  {
    id: 9, level: "basic", topic: "Integrity",
    question: "What are integrity rules in DBMS?",
    answer: "Entity Integrity: The primary key should not have NULL values.\n\nReferential Integrity: A foreign key should either have a NULL value or should be the primary key of another relation.",
    tags: ["integrity", "entity integrity", "referential integrity"]
  },
  {
    id: 10, level: "basic", topic: "Normalization",
    question: "What is 'normalization', and why is it applied to data in the first place?",
    answer: "Data redundancy means repeating the same data in several places, making CRUD operations difficult and wasting storage space. Normalization eliminates this redundant data, solving these issues.",
    tags: ["normalization", "data redundancy"]
  },
  {
    id: 11, level: "basic", topic: "Transactions",
    question: "What do you mean by a deadlock in Database Management System?",
    answer: "A deadlock occurs when one task waits for another task to release a resource that the first task is currently holding — creating a circular wait with no progress possible.",
    tags: ["deadlock", "transactions", "concurrency"]
  },
  {
    id: 12, level: "basic", topic: "Normalization",
    question: "What is denormalization?",
    answer: "Denormalization is a database optimization technique where redundant data is intentionally introduced into a database to improve performance by reducing the need for complex join operations.",
    tags: ["denormalization", "performance", "optimization"]
  },
  {
    id: 13, level: "basic", topic: "Recovery",
    question: "What are the checkpoints for DBMS?",
    answer: "The checkpoint method clears the system of all previous logs and saves them in a format that cannot be altered on the storage device. After every checkpoint, previous logs are deleted and placed on storage. This speeds up recovery because only logs since the last checkpoint need to be applied.",
    tags: ["checkpoints", "recovery", "logs"]
  },
  {
    id: 14, level: "basic", topic: "Architecture",
    question: "What is meant by the phrase 'data independence'?",
    answer: "Data independence refers to a situation where the application is independent of the storage structure. The capability to modify the schema definition at one level should not influence the schema definition at the next higher level.",
    tags: ["data independence", "schema", "architecture"]
  },
  {
    id: 15, level: "basic", topic: "Data Models",
    question: "What is an object-oriented model?",
    answer: "The object-oriented model organizes data and behavior into objects. Objects are instances of classes, which are blueprints defining the properties and methods objects possess. It promotes modular, reusable code and concepts like data abstraction and separation of concerns.",
    tags: ["object-oriented", "data model", "OOP"]
  },
  {
    id: 16, level: "intermediate", topic: "Query Processing",
    question: "In DBMS, what is meant by the term 'query decomposition'?",
    answer: "Query decomposition is the initial step in processing complex queries. A distributed calculus query is converted into an algebraic query based on global relations. Stages include: analysis, normalization, semantic analysis, simplification, and outer query rearrangement.",
    tags: ["query decomposition", "query processing", "relational algebra"]
  },
  {
    id: 17, level: "intermediate", topic: "Functional Dependency",
    question: "What is a functional dependency?",
    answer: "A functional dependency is a set of conditions where if two tuples have the same values for attributes A1, A2, ..., An, they must also be identical in values for non-key attributes B1, B2, ..., Bn. Denoted as X → Y, meaning X functionally determines Y.",
    tags: ["functional dependency", "normalization"]
  },
  {
    id: 18, level: "intermediate", topic: "Transactions",
    question: "What is meant by the term 'Serializability' in DBMS?",
    answer: "Serializability helps determine which non-serial schedules maintain database consistency. It relates to the isolation attribute of transactions and refers to a concurrency scheme where concurrent transactions' execution equals serial transactions' execution.",
    tags: ["serializability", "transactions", "concurrency", "isolation"]
  },
  {
    id: 19, level: "intermediate", topic: "SQL",
    question: "Can you define DML?",
    answer: "DML (Data Manipulation Language) allows users to access and modify data in the database. It includes: retrieving information, adding new data, removing information, and modifying previously stored information.",
    tags: ["DML", "SQL", "data manipulation"]
  },
  {
    id: 20, level: "intermediate", topic: "Integrity",
    question: "What are entity integrity constraints?",
    answer: "Entity integrity constraints stipulate that the value of the primary key cannot be null under any circumstance, because the primary key is used to uniquely identify each tuple. This constraint is applicable to one specific relation at a time.",
    tags: ["entity integrity", "primary key", "constraints", "NULL"]
  },
  {
    id: 21, level: "intermediate", topic: "Transactions",
    question: "What is the meaning of the term 'transaction'?",
    answer: "A transaction is a logical program execution unit that accesses and possibly modifies data items. Every transaction must satisfy ACID properties: Atomicity (all or nothing), Consistency (database remains valid), Isolation (concurrent transactions don't interfere), and Durability (committed changes persist).",
    tags: ["transaction", "ACID", "atomicity", "consistency", "isolation", "durability"]
  },
  {
    id: 22, level: "intermediate", topic: "Transactions",
    question: "What do you know about atomicity and aggregate levels?",
    answer: "Atomicity requires that either every action in a transaction is carried out or none are. The DBMS rolls back any unfinished transactions automatically.\n\nAggregation is a modeling concept for representing a relationship between a group of entities and the types of relationships between them.",
    tags: ["atomicity", "aggregation", "transactions", "ACID"]
  },
  {
    id: 23, level: "intermediate", topic: "Subquery",
    question: "What do you mean when you talk about a correlated subquery?",
    answer: "In a correlated subquery, the child query is executed for each row of the parent query. This occurs when the WHERE clause of the subquery references columns from the parent query.",
    tags: ["correlated subquery", "nested query", "subquery"]
  },
  {
    id: 24, level: "intermediate", topic: "RDBMS",
    question: "What is meant by the term 'RDBMS Kernel'?",
    answer: "The RDBMS has two components: the kernel (database software that manages the database) and the data dictionary (system-level storage structures). The RDBMS manages memory caches, paging, locking for concurrent access, user request scheduling, and table-space structures.",
    tags: ["RDBMS kernel", "data dictionary", "architecture"]
  },
  {
    id: 25, level: "intermediate", topic: "Triggers",
    question: "What is the meaning of 'Database Trigger'?",
    answer: "A database trigger is a PL/SQL block that automatically executes for INSERT, UPDATE, and DELETE statements against a table. It can be set to run once per statement and can call other stored procedures written in PL/SQL.",
    tags: ["trigger", "PL/SQL", "database trigger"]
  },
  {
    id: 26, level: "intermediate", topic: "Procedures",
    question: "What do you know about 'Stand-Alone Procedures'?",
    answer: "Stand-alone procedures are procedures not part of a package — they are separately specified. Their drawback is that they must be compiled while the program is still running, which can slow execution. They also cannot be referenced by Oracle tools.",
    tags: ["stand-alone procedures", "PL/SQL", "stored procedures"]
  },
  {
    id: 27, level: "intermediate", topic: "SQL",
    question: "What is SQL, and why is it considered so crucial today?",
    answer: "SQL (Structured Query Language) is the essential language for data processing. It is a data sublanguage used to generate and interpret database data and metadata — not a complete programming language. Today, every DBMS software uses SQL.",
    tags: ["SQL", "structured query language", "database language"]
  },
  {
    id: 28, level: "intermediate", topic: "Functional Dependency",
    question: "Why are 'Functional Dependencies' not defined as equations?",
    answer: "Equations represent relationships between numerical values. Functional database dependency examines the existence of a determining link between attributes regardless of whether those attributes share a numerical relationship, making them broader than equations.",
    tags: ["functional dependency", "equations"]
  },
  {
    id: 29, level: "intermediate", topic: "Referential Integrity",
    question: "What is meant by the phrase 'cascading update'?",
    answer: "To maintain referential integrity, foreign key values must correspond to primary key values. If a primary key is updated, the corresponding foreign key must also be updated. A cascading update implements this change automatically in the DBMS.",
    tags: ["cascading update", "referential integrity", "foreign key"]
  },
  {
    id: 30, level: "intermediate", topic: "Database Design",
    question: "What are the reasons behind the need for a new database design?",
    answer: "1. To correct errors from the initial design and improve the database's structure.\n2. To accommodate shifting system requirements as information systems and organizations co-evolve.",
    tags: ["database design", "redesign", "requirements"]
  },
  {
    id: 31, level: "intermediate", topic: "OLAP",
    question: "What do you know about OLAP?",
    answer: "OLAP (On-line Analytical Processing) is an advanced BI reporting tool. It allows arithmetic operations like summing, counting, and averaging on groupings of data. OLAP reports contain measurements (data values) and dimensions (features). They are sometimes called OLAP cubes.",
    tags: ["OLAP", "business intelligence", "analytics"]
  },
  {
    id: 32, level: "advanced", topic: "ER Model",
    question: "Explain E-R Diagram.",
    answer: "E-R (Entity-Relationship) Diagram is a comprehensive, precise logical depiction of an organization's information. It includes entities, non-prime attributes, relationship matrices, and cardinalities. It is used to display an entity-relationship network model or conceptual data model.",
    tags: ["ER diagram", "entity relationship", "data modeling"]
  },
  {
    id: 33, level: "advanced", topic: "Constraints",
    question: "Please describe the domain constraints.",
    answer: "Domain constraints include entity integrity and referential integrity. The domain consists of all possible values for common attributes.\n\nEntity integrity: No component of a primary key can be null.\nReferential integrity: Every foreign key value must either correspond to a primary key or be null.",
    tags: ["domain constraints", "entity integrity", "referential integrity"]
  },
  {
    id: 34, level: "advanced", topic: "Data Warehousing",
    question: "What is data warehousing?",
    answer: "Data warehousing refers to storing data in a central area and providing users with concurrent access to facilitate strategic decision-making. It is a framework managed through enterprise management tools.",
    tags: ["data warehousing", "business intelligence", "enterprise"]
  },
  {
    id: 35, level: "advanced", topic: "Database Systems",
    question: "What is 'System R'?",
    answer: "System R is a database management system developed by IBM that offers high data independence and physical database abstraction from end users. It includes data consistency and management features such as triggered transactions, authentication, and integrity assertions.",
    tags: ["System R", "IBM", "database history"]
  },
  {
    id: 36, level: "advanced", topic: "Database Architecture",
    question: "Can you describe the major differences between extension and intention?",
    answer: "Intension: A fixed value specified during database design (the table schema). Not expected to change frequently.\n\nExtension: The actual data that exists at a particular point in time (database snapshot). Changes with every insert, update, or delete.",
    tags: ["extension", "intension", "schema", "database snapshot"]
  },
  {
    id: 37, level: "advanced", topic: "Architecture",
    question: "Can you describe 2-Tier architecture?",
    answer: "In 2-Tier architecture, the User Interface (UI) runs on a client computer. The client does not have direct access to the database, which increases the database's level of protection against unauthorized use.",
    tags: ["2-tier architecture", "client-server", "architecture"]
  },
  {
    id: 38, level: "advanced", topic: "Architecture",
    question: "What are the key differences between 2-tier and 3-tier architecture?",
    answer: "2-Tier: Application logic is in the server database, the client UI, or both.\n\n3-Tier: Application logic is buried in a separate intermediate (middle) layer, functioning independently from both the client UI and the data interface.",
    tags: ["2-tier", "3-tier", "architecture", "middleware"]
  },
  {
    id: 39, level: "advanced", topic: "NoSQL",
    question: "What is 'MongoDB'?",
    answer: "MongoDB is a non-relational, open-source document database. Data is organized into collections, with each record as a document (JSON-like object) with no fixed schema. Documents are stored in binary-encoded BSON format.",
    tags: ["MongoDB", "NoSQL", "document database", "BSON"]
  },
  {
    id: 40, level: "advanced", topic: "Database Objects",
    question: "What is a catalog?",
    answer: "A catalog is a table containing information about: the structure of each database file, the type of each data item, storage format, and constraints on the data. The information in the catalog is called metadata.",
    tags: ["catalog", "metadata", "data dictionary"]
  },
  {
    id: 41, level: "advanced", topic: "Performance",
    question: "What are Indexes?",
    answer: "Database indexes are data structures that increase the speed of data retrieval at the cost of increased writes and additional storage space. Data on disc can only be stored in one order, so non-clustered indexes allow faster tailored searches based on frequently queried values.",
    tags: ["indexes", "performance", "data structures", "query optimization"]
  },
  {
    id: 42, level: "advanced", topic: "Query",
    question: "Can you explain QBE?",
    answer: "QBE (Query-by-Example) is a visual/graphical method for querying a database. It does not require programming knowledge. Queries are written using two-dimensional grammar resembling tables, using skeleton tables to express queries.",
    tags: ["QBE", "query by example", "visual query"]
  },
  {
    id: 43, level: "advanced", topic: "Database Objects",
    question: "What are temporary tables?",
    answer: "Temporary tables exist only for a single session, with data kept only for the duration of the database transaction. Unlike permanent tables, they start with no allocated space — space is dynamically allocated. Created using: CREATE GLOBAL TEMPORARY TABLE.",
    tags: ["temporary tables", "session tables", "Oracle"]
  },
  {
    id: 44, level: "advanced", topic: "Transactions",
    question: "What do you mean by durability in DBMS?",
    answer: "Durability ensures that once the DBMS reports a transaction as successfully completed, its effects persist even if the system crashes. Committed transaction data is saved in non-volatile memory, protected against unexpected system failures.",
    tags: ["durability", "ACID", "transactions", "persistence"]
  },
  {
    id: 45, level: "advanced", topic: "Procedures",
    question: "Can you explain the 'Stored Procedure'?",
    answer: "A stored procedure is a collection of SQL statements formatted as a function with a specific name, saved in the RDBMS for retrieval and execution at any time. They encapsulate business logic, improve performance, and add a layer of security.",
    tags: ["stored procedure", "SQL", "PL/SQL", "RDBMS"]
  },
  {
    id: 46, level: "advanced", topic: "ER Model",
    question: "What exactly do you mean when you talk about the 'E-R Model'?",
    answer: "The E-R (Entity Relational) Model is a technique for symbolizing logical relationships between a collection of entities or real-world objects. It was conceptualized by Peter Pin-Shan Chen in the 1970s. It represents entities, attributes, and relationships between them.",
    tags: ["ER model", "entity relationship", "Peter Chen", "data modeling"]
  },
  {
    id: 47, level: "advanced", topic: "Connectivity",
    question: "Can you describe ODBC?",
    answer: "ODBC (Open Database Connectivity) is a standardized interface that allows application programs to access and process SQL databases. To use ODBC, you need: a driver, server name, database name, user ID, and password. It is essential for Internet applications.",
    tags: ["ODBC", "connectivity", "SQL", "interface"]
  }
];

// ─── Seed Function ───────────────────────────────────────────────────────────
async function seedDBMS() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Drop existing DBMS questions
    await DBMSQuestion.deleteMany({});
    console.log('🗑️  Cleared existing DBMS questions');

    // Insert all questions
    const result = await DBMSQuestion.insertMany(dbmsQuestions);
    console.log(`✅ Successfully inserted ${result.length} DBMS interview questions`);

    // Summary
    const basic = result.filter(q => q.level === 'basic').length;
    const intermediate = result.filter(q => q.level === 'intermediate').length;
    const advanced = result.filter(q => q.level === 'advanced').length;
    console.log(`\n📊 Summary:\n  Basic: ${basic}\n  Intermediate: ${intermediate}\n  Advanced: ${advanced}`);

  } catch (err) {
    console.error('❌ Seeding failed:', err.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

seedDBMS();