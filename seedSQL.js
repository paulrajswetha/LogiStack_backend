// seedSQL.js — Run this script once to populate SQL interview questions
// Usage: node seedSQL.js
// Make sure your .env has MONGODB_URI set

const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI;

// ─── Schema ──────────────────────────────────────────────────────────────────
const SQLQuestionSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  level: { type: String, enum: ['basic', 'intermediate', 'advanced'], required: true },
  topic: { type: String, required: true },
  question: { type: String, required: true },
  answer: { type: String, required: true },
  tags: [{ type: String }],
  createdAt: { type: Date, default: Date.now }
});

const SQLQuestion = mongoose.model('SQLQuestion', SQLQuestionSchema);

// ─── Data ─────────────────────────────────────────────────────────────────────
const sqlQuestions = [
  {
    id: 1,
    level: "basic",
    topic: "Salary Queries",
    question: "Write a query to find employees with the second highest salary in a table.",
    answer: "Option 1: Using subquery\n\nSELECT MAX(salary) AS second_highest_salary \nFROM employees \nWHERE salary < (SELECT MAX(salary) FROM employees);\n\nOption 2: Using DISTINCT, ORDER BY, and LIMIT (MySQL/PostgreSQL)\n\nSELECT DISTINCT salary \nFROM employees \nORDER BY salary DESC \nLIMIT 1 OFFSET 1;\n\nOption 3: Using DENSE_RANK() with CTE\n\nWITH ranked_salaries AS (\n  SELECT salary, DENSE_RANK() OVER (ORDER BY salary DESC) AS rank_num\n  FROM employees\n)\nSELECT DISTINCT salary \nFROM ranked_salaries \nWHERE rank_num = 2;\n\nExplanation: The inner query finds the highest salary. The outer query finds the maximum salary less than that, which gives the second highest.",
    tags: ["salary", "subquery", "ranking", "second highest"]
  },
  {
    id: 2,
    level: "basic",
    topic: "Joins",
    question: "Explain the difference between INNER JOIN and OUTER JOIN with examples.",
    answer: "INNER JOIN: Returns only matching records from both tables.\n\nSELECT e.name, d.department_name\nFROM employees e\nINNER JOIN departments d ON e.department_id = d.department_id;\n-- Output: Only employees who belong to a department\n\nLEFT OUTER JOIN: Returns all records from the left table, and matching records from the right table. If no match, NULL is returned.\n\nSELECT e.name, d.department_name\nFROM employees e\nLEFT JOIN departments d ON e.department_id = d.department_id;\n-- Output: All employees, with department info where available\n\nRIGHT OUTER JOIN: Returns all records from the right table, and matching records from the left.\n\nFULL OUTER JOIN: Returns all records from both tables, matching where possible.\n\nKey Difference: INNER JOIN = intersection (matched data only), OUTER JOIN = union + NULLs (matched + unmatched data)",
    tags: ["joins", "inner join", "outer join", "left join", "right join"]
  },
  {
    id: 3,
    level: "basic",
    topic: "Salary Queries",
    question: "Write a query to fetch the second-highest salary from an employee table.",
    answer: "Option 1: Using DISTINCT, ORDER BY, and LIMIT (MySQL/PostgreSQL)\n\nSELECT DISTINCT salary \nFROM employees \nORDER BY salary DESC \nLIMIT 1 OFFSET 1;\n\nOption 2: Using subquery (Generic SQL)\n\nSELECT MAX(salary)\nFROM employees\nWHERE salary < (SELECT MAX(salary) FROM employees);\n\nExplanation: The subquery fetches the highest salary. The outer query finds the maximum salary less than the highest - giving the second-highest.",
    tags: ["salary", "second highest", "subquery", "limit"]
  },
  {
    id: 4,
    level: "basic",
    topic: "Grouping",
    question: "How do you use GROUP BY and HAVING together? Provide an example.",
    answer: "Use GROUP BY to group data and HAVING to filter aggregated results (unlike WHERE, which filters raw rows).\n\nSELECT department_id, COUNT(*) AS emp_count\nFROM employees\nGROUP BY department_id\nHAVING COUNT(*) > 5;\n\nExplanation: Groups employees by department. Filters groups where the count of employees is more than 5.",
    tags: ["group by", "having", "aggregation", "filtering"]
  },
  {
    id: 5,
    level: "intermediate",
    topic: "Self Join",
    question: "Write a query to find employees earning more than their managers.",
    answer: "Assume the table employees has: emp_id, name, salary, manager_id\n\nSELECT e.name AS employee_name, e.salary, m.name AS manager_name, m.salary AS manager_salary\nFROM employees e\nJOIN employees m ON e.manager_id = m.emp_id\nWHERE e.salary > m.salary;\n\nExplanation: Self-join matches employees (e) with their managers (m). Filters those where employee's salary > manager's salary.",
    tags: ["self join", "salary", "comparison", "manager"]
  },
  {
    id: 6,
    level: "intermediate",
    topic: "Window Functions",
    question: "What is a window function in SQL? Provide examples of ROW_NUMBER and RANK.",
    answer: "Definition: A window function performs calculations across a set of table rows related to the current row - without collapsing rows like GROUP BY.\n\nSyntax: FUNCTION_NAME() OVER (PARTITION BY column ORDER BY column)\n\nROW_NUMBER() Example - Assigns a unique sequential number to each row within a partition:\n\nSELECT name, department, salary,\nROW_NUMBER() OVER (PARTITION BY department ORDER BY salary DESC) AS row_num \nFROM employees;\n\nRANK() Example - Assigns the same rank to rows with equal values, but skips the next rank(s):\n\nSELECT name, department, salary,\nRANK() OVER (PARTITION BY department ORDER BY salary DESC) AS rank_num \nFROM employees;\n\nIf 2 employees have the same salary, both get rank 1, and the next gets rank 3.",
    tags: ["window functions", "row_number", "rank", "over"]
  },
  {
    id: 7,
    level: "basic",
    topic: "Top N Queries",
    question: "Write a query to fetch the top 3 performing products based on sales.",
    answer: "Option 1: Using ORDER BY and LIMIT\n\nSELECT product_id, product_name, total_sales\nFROM sales_data\nORDER BY total_sales DESC\nLIMIT 3;\n\nOption 2: Using RANK() (if ties matter)\n\nSELECT product_id, product_name, total_sales\nFROM (\n  SELECT *, RANK() OVER (ORDER BY total_sales DESC) AS rank_num\n  FROM sales_data\n) ranked_sales\nWHERE rank_num <= 3;",
    tags: ["top n", "ranking", "limit", "sales"]
  },
  {
    id: 8,
    level: "basic",
    topic: "Set Operations",
    question: "Explain the difference between UNION and UNION ALL.",
    answer: "UNION: Removes duplicates, slower (because of sorting), use when you want distinct rows.\n\nUNION ALL: Keeps all rows including duplicates, faster (no de-duplication), use when duplicates are meaningful.\n\nExample:\nSELECT city FROM customers \nUNION \nSELECT city FROM vendors; \n-- Returns a unique list of cities.\n\nSELECT city FROM customers \nUNION ALL \nSELECT city FROM vendors; \n-- Returns all cities, including duplicates.",
    tags: ["union", "union all", "set operations", "duplicates"]
  },
  {
    id: 9,
    level: "basic",
    topic: "Conditional Logic",
    question: "How do you use a CASE statement in SQL? Provide an example.",
    answer: "CASE lets you write conditional logic in SQL (similar to IF/ELSE).\n\nSELECT name, salary,\n  CASE \n    WHEN salary >= 100000 THEN 'High'\n    WHEN salary >= 50000 THEN 'Medium'\n    ELSE 'Low'\n  END AS salary_category\nFROM employees;\n\nExplanation: Assigns a category based on salary value. Works inside SELECT, WHERE, ORDER BY, etc.",
    tags: ["case", "conditional", "if else", "logic"]
  },
  {
    id: 10,
    level: "intermediate",
    topic: "Window Functions",
    question: "Write a query to calculate the cumulative sum of sales.",
    answer: "Assume table sales has: order_date, product_id, sales_amount\n\nSELECT order_date, product_id, sales_amount,\n  SUM(sales_amount) OVER (PARTITION BY product_id ORDER BY order_date) AS cumulative_sales\nFROM sales;\n\nExplanation: SUM(...) OVER (...) calculates a running total per product based on order date. PARTITION BY groups by product, and ORDER BY ensures the accumulation follows chronological order.",
    tags: ["cumulative sum", "running total", "window functions", "over"]
  },
  {
    id: 11,
    level: "intermediate",
    topic: "CTE",
    question: "What is a CTE (Common Table Expression), and how is it used?",
    answer: "Definition: A CTE is a temporary, named result set that you can reference within a SQL query. It improves readability and simplifies complex subqueries or recursive logic.\n\nSyntax:\nWITH cte_name AS (\n  SELECT ...\n)\nSELECT * FROM cte_name;\n\nExample - Filter top-paid employees using CTE:\nWITH HighEarners AS (\n  SELECT emp_id, name, salary \n  FROM employees \n  WHERE salary > 100000\n)\nSELECT * FROM HighEarners;\n\nBenefits: Reusable and readable, allows recursion (e.g., hierarchical data), avoids repeating subqueries.",
    tags: ["cte", "common table expression", "with clause", "temporary result"]
  },
  {
    id: 12,
    level: "intermediate",
    topic: "Aggregation",
    question: "Write a query to identify customers who have made transactions above $5,000 multiple times.",
    answer: "Assume transactions table has: customer_id, transaction_amount\n\nSELECT customer_id, COUNT(*) AS high_value_txns\nFROM transactions\nWHERE transaction_amount > 5000\nGROUP BY customer_id\nHAVING COUNT(*) > 1;\n\nExplanation: Filters high-value transactions (>5000). Groups them by customer. Returns customers who've done this more than once.",
    tags: ["aggregation", "having", "filtering", "count"]
  },
  {
    id: 13,
    level: "basic",
    topic: "Data Manipulation",
    question: "Explain the difference between DELETE and TRUNCATE commands.",
    answer: "DELETE:\n- DML command\n- Removes rows one by one\n- Can use WHERE clause\n- Slower (logs each deletion)\n- Can be rolled back\n- Does not reset identity/auto-increment\n\nTRUNCATE:\n- DDL command\n- Removes all rows at once\n- Cannot use WHERE clause\n- Faster (minimal logging)\n- Cannot be rolled back in most databases\n- Resets identity/auto-increment\n\nTRUNCATE is generally used when you need to quickly remove all rows from a table.",
    tags: ["delete", "truncate", "ddl", "dml", "difference"]
  },
  {
    id: 14,
    level: "advanced",
    topic: "Performance",
    question: "How do you optimize SQL queries for better performance?",
    answer: "Key SQL optimization techniques:\n\n1. Use SELECT only required columns (avoid SELECT *)\n\n2. Create proper indexes - Index frequently used columns in JOIN, WHERE, ORDER BY\n\n3. Avoid functions on indexed columns:\n   -- Slower: WHERE YEAR(order_date) = 2024\n   -- Better: WHERE order_date BETWEEN '2024-01-01' AND '2024-12-31'\n\n4. Use EXISTS instead of IN (for subqueries):\n   SELECT name FROM customers c \n   WHERE EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.customer_id);\n\n5. Avoid unnecessary joins or nested subqueries\n\n6. Use appropriate data types and avoid implicit conversions\n\n7. Analyze execution plans (EXPLAIN or EXPLAIN ANALYZE)",
    tags: ["optimization", "performance", "indexes", "query tuning"]
  },
  {
    id: 15,
    level: "intermediate",
    topic: "Anti Join",
    question: "Write a query to find all customers who have not made any purchases in the last 6 months.",
    answer: "Assume:\ncustomers(customer_id, name)\ntransactions(customer_id, transaction_date)\n\nSELECT c.customer_id, c.name\nFROM customers c \nLEFT JOIN transactions t \n  ON c.customer_id = t.customer_id \n  AND t.transaction_date >= CURRENT_DATE - INTERVAL '6 months'\nWHERE t.customer_id IS NULL;\n\nExplanation: LEFT JOIN includes all customers. WHERE t.customer_id IS NULL ensures the customer had no purchase in the last 6 months.",
    tags: ["anti join", "left join", "null check", "date filtering"]
  },
  {
    id: 16,
    level: "basic",
    topic: "NULL Handling",
    question: "How do you handle NULL values in SQL? Provide examples.",
    answer: "NULL represents missing or unknown data.\n\n1. Using IS NULL / IS NOT NULL:\n   SELECT * FROM employees WHERE manager_id IS NULL;\n\n2. Replace NULL using COALESCE() or IFNULL():\n   SELECT name, COALESCE(phone_number, 'Not Provided') AS contact \n   FROM customers;\n\n3. Handling NULLs in aggregation (AVG, SUM ignore NULLs by default):\n   SELECT AVG(salary) FROM employees;\n\n4. Conditional checks:\n   SELECT name, \n     CASE WHEN salary IS NULL THEN 'Unknown' ELSE 'Known' END AS salary_status \n   FROM employees;",
    tags: ["null", "coalesce", "is null", "null handling"]
  },
  {
    id: 17,
    level: "advanced",
    topic: "Pivoting",
    question: "Write a query to transpose rows into columns.",
    answer: "Assume a table sales with: region, month, sales_amount\n\nUsing CASE:\nSELECT region,\n  SUM(CASE WHEN month = 'Jan' THEN sales_amount ELSE 0 END) AS Jan,\n  SUM(CASE WHEN month = 'Feb' THEN sales_amount ELSE 0 END) AS Feb,\n  SUM(CASE WHEN month = 'Mar' THEN sales_amount ELSE 0 END) AS Mar\nFROM sales\nGROUP BY region;\n\nUsing PIVOT (SQL Server or Oracle syntax):\nSELECT region, [Jan], [Feb], [Mar]\nFROM (\n  SELECT region, month, sales_amount\n  FROM sales\n) AS src\nPIVOT (\n  SUM(sales_amount) FOR month IN ([Jan], [Feb], [Mar])\n) AS p;",
    tags: ["pivot", "transpose", "case", "crosstab"]
  },
  {
    id: 18,
    level: "intermediate",
    topic: "Indexes",
    question: "Explain indexing and how it improves query performance.",
    answer: "What is an index? An index is a data structure that improves the speed of data retrieval operations on a database table at the cost of additional space and write-time performance.\n\nHow indexing helps:\n- Search performance: Fast (uses binary/tree search) vs Slow (full scan)\n- Used in WHERE, JOIN, ORDER BY, GROUP BY\n- Types: B-tree (default), Bitmap, Hash, etc.\n\nExample:\nCREATE INDEX idx_customer_id ON transactions(customer_id);\n\nImportant notes:\n- Too many indexes can slow down INSERT/UPDATE\n- Avoid indexing columns with low cardinality (e.g., gender)\n- Use composite indexes when querying multiple columns together",
    tags: ["indexes", "performance", "optimization", "b-tree"]
  },
  {
    id: 19,
    level: "basic",
    topic: "Aggregation",
    question: "Write a query to fetch the maximum transaction amount for each customer.",
    answer: "Assume a transactions table with customer_id, transaction_id, amount\n\nSELECT customer_id, MAX(amount) AS max_transaction\nFROM transactions\nGROUP BY customer_id;\n\nExplanation: GROUP BY groups all transactions by customer. MAX(amount) returns the highest transaction for each group (customer).",
    tags: ["max", "group by", "aggregation", "transactions"]
  },
  {
    id: 20,
    level: "intermediate",
    topic: "Self Join",
    question: "What is a self-join, and how is it used?",
    answer: "Definition: A self-join is a regular join where a table is joined with itself. It is useful when rows in a table are related to other rows in the same table.\n\nExample Use Case - Employees and Managers:\nAssume: emp_id, name, manager_id (where manager_id refers to emp_id of another employee)\n\nQuery to get employee names along with their manager names:\nSELECT e.name AS employee_name, m.name AS manager_name\nFROM employees e\nLEFT JOIN employees m ON e.manager_id = m.emp_id;\n\nExplanation: e is alias for employees (as employee), m is another alias for the same table (as manager). The join links an employee to their manager using manager_id = emp_id.",
    tags: ["self join", "join", "alias", "hierarchical"]
  },
  {
    id: 21,
    level: "advanced",
    topic: "Database Design",
    question: "How would you design a database to store credit card transactions?",
    answer: "Database design:\n\n1. Customers Table: customer_id (PK), name, email, phone, address\n\n2. Cards Table: card_id (PK), customer_id (FK), card_number (masked), card_type, status, issued_date\n\n3. Merchants Table: merchant_id (PK), name, category, location\n\n4. Transactions Table: transaction_id (PK), card_id (FK), merchant_id (FK), transaction_date, amount, currency, status, location\n\nBest Practices:\n- Mask sensitive fields (like card numbers)\n- Store card_number as encrypted or tokenized\n- Use partitioning on date fields for faster querying\n- Add indexes on card_id, merchant_id, transaction_date",
    tags: ["database design", "transactions", "normalization", "security"]
  },
  {
    id: 22,
    level: "intermediate",
    topic: "Aggregation",
    question: "Write a query to identify the most profitable regions based on transaction data.",
    answer: "Assume a transactions table with: transaction_id, customer_id, amount, region, transaction_date\n\nQuery to find top 3 profitable regions:\nSELECT region, SUM(amount) AS total_revenue\nFROM transactions\nGROUP BY region\nORDER BY total_revenue DESC\nLIMIT 3;\n\nExplanation: Aggregates transaction amounts per region. Orders regions by total revenue. Retrieves top 3 using LIMIT.\n\nOptional: You could also calculate profit by subtracting costs (if a cost column is present).",
    tags: ["aggregation", "sum", "group by", "region", "profitability"]
  },
  {
    id: 23,
    level: "advanced",
    topic: "Analytics",
    question: "How would you analyze customer churn using SQL?",
    answer: "Step-by-step SQL approach:\n\nStep 1: Define churn (e.g., customer who hasn't transacted in last 6 months)\n\nStep 2: Query to identify churned customers:\nSELECT c.customer_id, c.name\nFROM customers c\nLEFT JOIN transactions t\n  ON c.customer_id = t.customer_id\n  AND t.transaction_date >= CURRENT_DATE - INTERVAL '6 months'\nWHERE t.transaction_id IS NULL;\n\nStep 3: Analyze churn metrics:\n- Churn rate = (Churned Customers/Total Customers) * 100\n- Monthly churn trend\n- Compare churned vs. active customers in terms of average spend",
    tags: ["churn", "analytics", "customer retention", "left join"]
  },
  {
    id: 24,
    level: "advanced",
    topic: "Database Concepts",
    question: "Explain the difference between OLAP and OLTP databases.",
    answer: "OLTP (Online Transaction Processing):\n- Handles real-time transactional operations (INSERT, UPDATE, DELETE)\n- Highly normalized (3NF)\n- Fast for read/write of single rows\n- Users: Clerks, DBAs\n- Examples: Banking systems, e-commerce\n\nOLAP (Online Analytical Processing):\n- Handles complex analytical/reporting queries\n- De-normalized (star/snowflake schema)\n- Fast for complex analytical queries\n- Users: Analysts, Data Scientists\n- Examples: Business intelligence, dashboards\n\nIn short: OLTP = operational, fast, real-time transactions. OLAP = analytical, slow-changing, historical data.",
    tags: ["olap", "oltp", "database types", "analytics", "transactions"]
  },
  {
    id: 25,
    level: "intermediate",
    topic: "Analytics",
    question: "How would you determine the Average Revenue Per User (ARPU) from transaction data?",
    answer: "ARPU = Total Revenue / Total Number of Users\n\nAssume a transactions table with: transaction_id, customer_id, amount, transaction_date\n\nBasic ARPU Query:\nSELECT SUM(amount) * 1.0 / COUNT(DISTINCT customer_id) AS ARPU\nFROM transactions;\n\nMonthly ARPU Query:\nSELECT\n  DATE_TRUNC('month', transaction_date) AS month,\n  SUM(amount) * 1.0 / COUNT(DISTINCT customer_id) AS monthly_arpu\nFROM transactions\nGROUP BY month\nORDER BY month;",
    tags: ["arpu", "revenue", "analytics", "kpi", "average"]
  },
  {
    id: 26,
    level: "intermediate",
    topic: "Joins",
    question: "Describe a scenario where you would use a LEFT JOIN instead of an INNER JOIN.",
    answer: "Use LEFT JOIN when you want all records from the left table, even if there's no matching record in the right table.\n\nReal-life Scenario: List all customers and their transactions — even if they haven't made any.\n\nQuery:\nSELECT c.customer_id, c.name, t.transaction_id, t.amount\nFROM customers c\nLEFT JOIN transactions t ON c.customer_id = t.customer_id;\n\nWhy LEFT JOIN?\n- Shows all customers, including those with no transactions (returns NULLs for those)\n- Using INNER JOIN would exclude customers with zero activity",
    tags: ["left join", "inner join", "scenario", "null"]
  },
  {
    id: 27,
    level: "advanced",
    topic: "Analytics",
    question: "Write a query to calculate YoY (Year-over-Year) growth for a set of transactions.",
    answer: "Assume a table named transactions with: customer_id, transaction_date, amount\n\nWITH yearly_revenue AS (\n  SELECT\n    EXTRACT(YEAR FROM transaction_date) AS year,\n    SUM(amount) AS total_revenue\n  FROM transactions\n  GROUP BY EXTRACT(YEAR FROM transaction_date)\n)\nSELECT\n  curr.year AS current_year,\n  curr.total_revenue,\n  prev.total_revenue AS previous_year_revenue,\n  ROUND(((curr.total_revenue - prev.total_revenue) / prev.total_revenue) * 100, 2) AS yoy_growth_percent\nFROM yearly_revenue curr\nLEFT JOIN yearly_revenue prev\n  ON curr.year = prev.year + 1;\n\nExplanation: Joins each year to its previous year. Computes YoY growth as a percentage.",
    tags: ["yoy", "year over year", "growth", "analytics", "cte"]
  },
  {
    id: 28,
    level: "advanced",
    topic: "Fraud Detection",
    question: "How would you implement fraud detection using transactional data?",
    answer: "Possible SQL-Based Checks:\n\n1. Unusual Amounts: Flag transactions > 3x average amount of that user\n\n2. Rapid Repeats: Detect multiple transactions from same user within seconds\n\n3. Location Mismatch: Transactions from different countries within a short time\n\n4. Card Sharing: Same card used by different customers\n\nExample Query - Unusual high amount per user:\nWITH avg_txn AS (\n  SELECT customer_id, AVG(amount) AS avg_amount\n  FROM transactions\n  GROUP BY customer_id\n)\nSELECT t.*\nFROM transactions t\nJOIN avg_txn a ON t.customer_id = a.customer_id\nWHERE t.amount > 3 * a.avg_amount;",
    tags: ["fraud detection", "anomaly detection", "security", "alerts"]
  },
  {
    id: 29,
    level: "intermediate",
    topic: "Aggregation",
    question: "Write a query to find customers who have used more than 2 credit cards for transactions in a given month.",
    answer: "Assume a transactions table with: customer_id, card_id, transaction_date\n\nQuery:\nSELECT \n  customer_id,\n  TO_CHAR(transaction_date, 'YYYY-MM') AS txn_month,\n  COUNT(DISTINCT card_id) AS cards_used\nFROM transactions\nGROUP BY customer_id, TO_CHAR(transaction_date, 'YYYY-MM')\nHAVING COUNT(DISTINCT card_id) > 2;\n\nExplanation: Groups by customer_id and month. Counts distinct card_id used. Filters where more than 2 cards were used in a month.",
    tags: ["aggregation", "distinct count", "having", "cards"]
  },
  {
    id: 30,
    level: "advanced",
    topic: "Analytics",
    question: "How would you approach a business problem where you need to analyze the spending patterns of premium customers?",
    answer: "Step-by-step approach:\n\n1. Understand Objective: Define 'spending pattern' (frequency, amount, category, timing) and 'premium customer' (credit score, card tier, spend threshold)\n\n2. Data Collection: Customer table, Transactions table, Cards table\n\n3. Data Cleaning: Handle missing values, filter premium customers, enrich data\n\n4. Exploratory Analysis using SQL:\n   - Spend Amount: Average monthly/yearly spend\n   - Time Trends: Seasonality or weekly spending behavior\n   - Categories: Where they spend most (Travel, Dining, Shopping)\n   - Geography: City or region-wise behavior\n\n5. Segmentation: Group premium customers into high spenders, frequent spenders, category loyalists\n\n6. Business Recommendations: Personalize rewards, enhance retention, promote card upgrades\n\nSample SQL Query - Top 3 spending categories of premium customers monthly:\nSELECT customer_id, DATE_TRUNC('month', transaction_date) AS txn_month,\n  category, SUM(amount) AS total_spend\nFROM transactions\nWHERE customer_id IN (\n  SELECT customer_id FROM customers WHERE tier = 'Premium'\n)\nGROUP BY customer_id, txn_month, category\nORDER BY customer_id, txn_month, total_spend DESC;",
    tags: ["analytics", "customer analysis", "spending patterns", "business intelligence"]
  }
];

// ─── Seed Function ───────────────────────────────────────────────────────────
async function seedSQL() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Drop existing SQL questions
    await SQLQuestion.deleteMany({});
    console.log('🗑️  Cleared existing SQL questions');

    // Insert all questions
    const result = await SQLQuestion.insertMany(sqlQuestions);
    console.log(`✅ Successfully inserted ${result.length} SQL interview questions`);

    // Summary
    const basic = result.filter(q => q.level === 'basic').length;
    const intermediate = result.filter(q => q.level === 'intermediate').length;
    const advanced = result.filter(q => q.level === 'advanced').length;
    console.log(`\n📊 Summary:\n  Basic: ${basic}\n  Intermediate: ${intermediate}\n  Advanced: ${advanced}`);

    // Topic distribution
    const topicCount = {};
    result.forEach(q => {
      topicCount[q.topic] = (topicCount[q.topic] || 0) + 1;
    });
    console.log('\n📚 Topic Distribution:');
    Object.entries(topicCount).forEach(([topic, count]) => {
      console.log(`  ${topic}: ${count}`);
    });

  } catch (err) {
    console.error('❌ Seeding failed:', err.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

seedSQL();