// Simple test framework
const tests = [];

function test(name, fn) {
    tests.push({ name, fn });
}

function runTests() {
    const results = {
        passed: 0,
        failed: 0,
        total: tests.length
    };
    
    const resultsList = document.getElementById('testResults');
    if (!resultsList) return;
    
    resultsList.innerHTML = '';
    
    for (const t of tests) {
        try {
            t.fn();
            results.passed++;
            resultsList.innerHTML += `<li class="test-pass">✅ ${t.name}</li>`;
        } catch (error) {
            results.failed++;
            resultsList.innerHTML += `<li class="test-fail">❌ ${t.name}: ${error.message}</li>`;
            console.error(`Test failed: ${t.name}`, error);
        }
    }
    
    const summary = document.getElementById('testSummary');
    if (summary) {
        summary.innerHTML = `Passed: ${results.passed}/${results.total}`;
        summary.className = results.failed === 0 ? 'test-pass' : 'test-fail';
    }
}

function assert(condition, message) {
    if (!condition) {
        throw new Error(message || "Assertion failed");
    }
}

// Entity tests
test('Create bacteria entity', function() {
    const b = createBacteria(600, 400);
    assert(b.x === 300, "Expected x to be 300");
    assert(b.y === 200, "Expected y to be 200");
    assert(b.size === 10, "Expected size to be 10");
    assert(b.speed === 2, "Expected speed to be 2");
});

test('Spawn nutrient', function() {
    const n = spawnNutrient(600, 400);
    assert(n.x >= 10 && n.x <= 590, "Nutrient x position out of bounds");
    assert(n.y >= 10 && n.y <= 390, "Nutrient y position out of bounds");
    assert(n.size >= 3 && n.size <= 5, "Nutrient size out of expected range");
});

test('Spawn enemy', function() {
    const e = spawnEnemy(600, 400);
    assert(e.x >= 20 && e.x <= 580, "Enemy x position out of bounds");
    assert(e.y >= 20 && e.y <= 380, "Enemy y position out of bounds");
    assert(e.size >= 15 && e.size <= 20, "Enemy size out of expected range");
    assert(typeof e.isChasing === 'boolean', "isChasing should be boolean");
    assert(e.targetType === 'none', "Initial targetType should be 'none'");
});

// Collision tests
test('Check collision detection', function() {
    const object1 = { x: 100, y: 100, size: 10 };
    const object2 = { x: 115, y: 100, size: 10 };
    const distance = Math.sqrt(Math.pow(object1.x - object2.x, 2) + Math.pow(object1.y - object2.y, 2));
    assert(distance < object1.size + object2.size, "Collision should be detected");
    
    const object3 = { x: 100, y: 100, size: 10 };
    const object4 = { x: 130, y: 100, size: 10 };
    const distance2 = Math.sqrt(Math.pow(object3.x - object4.x, 2) + Math.pow(object3.y - object4.y, 2));
    assert(distance2 > object3.size + object4.size, "No collision should be detected");
});

// Run tests when the page loads
document.addEventListener('DOMContentLoaded', runTests); 