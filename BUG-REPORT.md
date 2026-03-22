# Bug Report: index-agents.html

**Reviewed**: 2026-03-22 09:06 PDT  
**URL**: https://camptracker.github.io/buffett-evaluator/index-agents.html

## 🐛 Critical Bugs

### 1. **PINS (Run 3) Doesn't Exist Yet (404 Error)**
**Severity**: High  
**Impact**: Selecting "PINS (Run 3)" will fail with alert box

**Issue**:
- Registry includes `'PINS (Run 3)': 'subagents/claude-code/evaluations/PINS-run3'`
- But `agent1.json` through `agent6.json` don't exist yet (evaluation in progress)
- User selecting Run 3 → `fetch()` returns 404 → alert(`Failed to load evaluation for PINS (Run 3)`)

**Fix**:
```javascript
// Option 1: Remove Run 3 from registry until evaluation completes
const companies = {
    'PINS (Run 1)': 'subagents/claude-code/evaluations/PINS-run1',
    'PINS (Run 2)': 'subagents/claude-code/evaluations/PINS-run2',
    // 'PINS (Run 3)': 'subagents/claude-code/evaluations/PINS-run3' // TODO: Add when complete
};

// Option 2: Check if files exist before adding to dropdown
async function loadCompanyList() {
    for (const [ticker, path] of Object.entries(companies)) {
        // Check if agent1.json exists
        const exists = await fetch(`${path}/agent1.json`, { method: 'HEAD' })
            .then(r => r.ok)
            .catch(() => false);
        
        if (exists) {
            const option = document.createElement('option');
            option.value = ticker;
            option.textContent = ticker;
            select.appendChild(option);
        }
    }
}
```

**Workaround**: Don't select Run 3 until evaluation finishes.

---

### 2. **Missing PWA Icons (404)**
**Severity**: Medium  
**Impact**: PWA install works but shows generic icon

**Issue**:
- `manifest.json` references `icon-192.png` and `icon-512.png`
- Both return 404 (files don't exist)
- `<link rel="apple-touch-icon" href="icon-192.png">` → 404

**Fix**: Generate icons (see `ICONS-TODO.md`) or remove icon references from manifest.

**Current Behavior**:
- iOS: Shows first letter "B" as icon
- Android: Shows generic app icon
- Install still works, just no custom branding

---

## ⚠️ Medium Bugs

### 3. **No Loading State**
**Severity**: Medium  
**Impact**: User sees blank screen while data loads (2-5 seconds)

**Issue**:
- `loadCompanyEvaluation()` fetches 6 JSON files
- No spinner/loading indicator shown
- User doesn't know if app is working

**Fix**:
```javascript
async function loadCompanyEvaluation(ticker) {
    const container = document.getElementById('evaluation-container');
    container.innerHTML = '<div class="loading">Loading evaluation...</div>';
    container.style.display = 'block';
    
    try {
        const agents = await Promise.all([...]);
        renderEvaluation(ticker, agents);
    } catch (error) {
        container.innerHTML = '<div class="error">Failed to load evaluation</div>';
    }
}
```

---

### 4. **No Error Details in Alert**
**Severity**: Low  
**Impact**: Hard to debug failed loads

**Issue**:
```javascript
catch (error) {
    alert(`Failed to load evaluation for ${ticker}`);
}
```

No details about WHICH file failed or WHY (404, network error, JSON parse error).

**Fix**:
```javascript
catch (error) {
    console.error(`Failed to load ${ticker}:`, error);
    const container = document.getElementById('evaluation-container');
    container.innerHTML = `
        <div class="error-message">
            <h3>Failed to load ${ticker}</h3>
            <p>${error.message}</p>
            <button onclick="location.reload()">Retry</button>
        </div>
    `;
    container.style.display = 'block';
}
```

---

## 🔍 Minor Issues

### 5. **Sections Start Collapsed**
**Severity**: Low (UX)  
**Impact**: User must manually expand each agent section

**Current**: All 6 agent sections collapsed by default (display: none)  
**Better UX**: Expand Agent 6 (Final Verdict) by default so user sees summary immediately

**Fix**:
```javascript
// In renderAgent6() or after render
document.getElementById('agent6-content').style.display = 'block';
document.querySelector('[data-section="agent6"]').textContent = '▲';
```

---

### 6. **No "Back to Top" Button**
**Severity**: Low (UX)  
**Impact**: On mobile, hard to get back to company selector after scrolling

**Fix**: Add floating button:
```html
<button id="back-to-top" onclick="window.scrollTo({top:0,behavior:'smooth'})">
    ↑ Top
</button>
```

---

### 7. **Toggle Button Accessibility**
**Severity**: Low (a11y)  
**Impact**: Screen readers don't know button purpose

**Fix**: Add aria-label:
```html
<button class="toggle-btn" 
        data-section="agent1" 
        aria-label="Toggle Agent 1 section"
        aria-expanded="false">▼</button>
```

---

### 8. **No Keyboard Navigation**
**Severity**: Low (a11y)  
**Impact**: Can't collapse/expand sections with keyboard (Enter/Space)

**Fix**: Add click handler also fires on Enter/Space keypress.

---

## ✅ Working Correctly

- ✅ Mobile-first responsive design
- ✅ Table horizontal scroll
- ✅ Dropdown population
- ✅ Data fetching for Run 1 & 2
- ✅ Agent rendering (all 6 agents)
- ✅ Score badges
- ✅ Color-coded criteria (PASS/FAIL)
- ✅ SEC citations visible
- ✅ Manifest.json valid (except icons)

---

## Priority Fixes

**Immediate (before Run 3 completes)**:
1. Remove Run 3 from registry OR add existence check

**High Priority**:
2. Add loading state
3. Expand Agent 6 by default

**Medium Priority**:
4. Generate PWA icons
5. Improve error messages

**Low Priority**:
6. Back-to-top button
7. Accessibility improvements

---

**Test Plan**: 
1. Select Run 1 → verify all agents load
2. Select Run 2 → verify all agents load  
3. Select Run 3 → CURRENTLY FAILS (expected until evaluation complete)
4. On mobile: verify tables scroll horizontally
5. Toggle sections → verify expand/collapse works
