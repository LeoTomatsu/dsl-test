/* 
   Author: Leo Tomatsu (leotomatsu@gmail.com)
   Doc: ../SUBMISSION.md
 */

/**
 * Determine and return node's dsl rule
 *
 * @param {DslNode} node - The node to execute
 * @param {DslNode} parentNode - The parent node of node to execute
 * @param {DslNode.bindings} bindings - Map of every binding in block
 * @returns *> - Appropriate output of dsl rule function
 */
function dslRuleHandler(node, parentNode, bindings) {
	/**
	 * Execute and return literal rule
	 *
	 * @param {DslNode} n - The node to execute
	 * @returns {number} value - Return its own value
	 */
	function literalRuleHandler(n) {
		const value = n.value;
		/* check if value is type number */
		if (typeof (value) !== 'number') {
			throw new Error(`literalHandler(): node ${n.id} not type number`);
		} else {
			return n.value;
		}
	}
	/**
	 * Execute and return identifier rule
	 *
	 * @param {DslNode} n - The node to execute
	 * @param {DslNode.bindings} b - Map of every binding in block
	 * @returns {DslNode.bindings} b - Returns the value that is bound
	 * 				   to it, defined by its scope it is in
	 */
	function identifierRuleHandler(n, b) {
		/* return identifier */
		return b[n.name];
	}
	/**
	 * Execute and return assignment rule
	 *
	 * Can only occur as a direct child of a block
	 *
	 * @param {DslNode} n - the node to execute
	 * @param {DslNode} pN - The parent node of node to execute
	 * @param {DslNode.bindings} b - Map of every binding in block
	 * @returns {DslNode.bindings} Bindings - Defines a reference-able value,
	 * 					  name that takes on the result
	 * 					  of executing value
	 */
	function assignmentRuleHandler(n, pN, b) {
		const Bindings = b;
		/* check if parent node is shape block */
		if (pN.shape === 'Block') {
			/* assign value with dsl rule */
			const value = dslRuleHandler(n.value, n, b);
			if (value !== undefined) {
				Bindings[n.name] = value;
			}
		} else {
			throw new Error(`assignmentRuleHandler: node ${n.id} invalid parent`);
		}
		return Bindings[n.name];
	}
	/**
	 * Execute and return function rule
	 *
	 * @param {DslNode} n - The node to execute
	 * @param {DslNode.bindings} b - Map of every binding in block
	 * @returns {DslNode} r - Returned the result of the args applied
	 * 			  to the result of the callee
	 */
	function functionRuleHandler(n, b) {
		/**
		 * Execute and return callee and args
		 *
		 * Helper function for functionRuleHandler
		 *
		 * @param {DslNode} N - The node to execute
		 * @param {DslNode.bindings} B - Map of every binding in block
		 * @returns array [callee, args] - The callee and args are executed
		 */
		function executeCalleeAndArgs(N, B) {
			/* determine callee */
			const callee = N.callee;
			const args = N.args;
			/* assign dsl rule to args */
			for (let i = 0, len = args.length; i < len; i++) {
				const cN = args[i];
				args[i] = dslRuleHandler(cN, N, B);
			}
			return [callee, args];
		}
		const parameters = executeCalleeAndArgs(n, b);
		const callee = parameters[0];
		const args = parameters[1];
		const operation = b[callee.name];
		/* check if operation is type function */
		if (typeof (operation) === 'function') {
			/* check if operation is valid */
			try {
				/* return outcome of operation */
				return operation(args[0], args[1]);
			} catch (e) {
				const msg = `functionRuleHandler(): node ${n.id} invalid operation: ${e}`;
				throw new Error(msg);
			}
		} else {
			const msg = `functionRuleHandler(): node ${n.id} invalid operation: not type function error`;
			throw new Error(msg);
		}
	}
	/**
	 * Execute and return block rule
	 *
	 * @param {DslNode} pN - The parent node to execute
	 * @param {DslNode.bindings} pB - The parent binding map of every binding in
	 * 				  block
	 * @returns {DslNode} rB - Return the last line of the result block
	 */
	function blockRuleHandler(pN, pB) {
		const n = pN.nodes;
		/* create child bindings */
		const cB = Object.assign({}, pB, pN.bindings);
		let rB = 0;
		/* assign child binding with child dsl rule */
		for (let i = 0, len = n.length; i < len; i++) {
			const childNode = n[i];
			/* return the last line of the result block */
			const value = dslRuleHandler(childNode, pN, cB);
			if (value !== undefined) {
				rB = value;
			}
		}
		return rB;
	}
	/**
	 * Execute and return array rule
	 *
	 * @param {DslNode} pN - The parentNode to execute
	 * @param {DslNode.bindings} b - Map of every binding in block
	 * @returns array r - Returns every element in the nodes of an
	 * 		      an array that are executed
	 */
	function arrayRuleHandler(pN, b) {
		const n = pN.nodes;
		const r = [];
		/* assign dsl rule to return array */
		for (let i = 0, len = n.length; i < len; i++) {
			const childNode = n[i];
			const value = dslRuleHandler(childNode, pN, b);
			/* if valid, push value into return array */
			if (value !== undefined) {
				r.push(value);
			}
		}
		return r;
	}
	/* Determine shape using switch statements and execute rule */
	try {
		switch (node.shape) {
		case 'Block':
			return blockRuleHandler(node, bindings);
		case 'Assignment':
			return assignmentRuleHandler(node, parentNode, bindings);
		case 'Array':
			return arrayRuleHandler(node, bindings);
		case 'Function':
			return functionRuleHandler(node, bindings);
		case 'Literal':
			return literalRuleHandler(node);
		case 'Identifier':
			return identifierRuleHandler(node, bindings);
		default:
			return undefined;
		}
	} catch (e) {
		console.error(e);
		return undefined;
	}
}

/**
 * Execute and return interestIds given the passed ast
 *
 * @param {DslNode} ast - The root ast to execute
 * @param {DslNode.id[]} interestIds - List of interested ids
 * @returns {Object<DslNode.id, *>} rMap - Result map of id -> value
 */
export const run = (ast, interestIds) => {
	const rMap = {};
	const parentNodes = ast.nodes;
	const parentBindings = ast.bindings;
	/* execute dsl rule on nodes */
	for (let i = 0, len = parentNodes.length; i < len; i++) {
		const childNode = parentNodes[i];
		const value = dslRuleHandler(childNode, ast, parentBindings);
		const id = childNode.id;
		/* include value if id is including in interest id */
		if (interestIds.includes(id) && value !== undefined) {
			rMap[id] = value;
		}
	}
	return rMap;
};
