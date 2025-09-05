// 初始化数据
let allTasks = JSON.parse(localStorage.getItem('allTasks')) || {}; // 按日期存储任务
let wishes = JSON.parse(localStorage.getItem('wishes')) || [];
let recurringTasks = JSON.parse(localStorage.getItem('recurringTasks')) || [];
let redeemedWishes = JSON.parse(localStorage.getItem('redeemedWishes')) || [];
let starsHistory = JSON.parse(localStorage.getItem('starsHistory')) || [];
let totalStars = parseInt(localStorage.getItem('totalStars')) || 0;

// 当前选择的日期（默认今天）
let currentDate = new Date();
let currentDateString = formatDate(currentDate);

// 日历视图的当前月份和年份
let calendarMonth = currentDate.getMonth();
let calendarYear = currentDate.getFullYear();

// DOM 元素
const taskListEl = document.getElementById('task-list');
const recurringTaskListEl = document.getElementById('recurring-task-list');
const wishListEl = document.getElementById('wish-list');
const totalStarsEl = document.getElementById('total-stars');
const newTaskNameEl = document.getElementById('new-task-name');
const newTaskStarsEl = document.getElementById('new-task-stars');
const addTaskBtnEl = document.getElementById('add-task-btn');
const newRecurringTaskNameEl = document.getElementById('new-recurring-task-name');
const newRecurringTaskStarsEl = document.getElementById('new-recurring-task-stars');
const addRecurringTaskBtnEl = document.getElementById('add-recurring-task-btn');
const newWishNameEl = document.getElementById('new-wish-name');
const newWishStarsEl = document.getElementById('new-wish-stars');
const addWishBtnEl = document.getElementById('add-wish-btn');
const bonusStarsEl = document.getElementById('bonus-stars');
const bonusReasonEl = document.getElementById('bonus-reason');
const addBonusBtnEl = document.getElementById('add-bonus-btn');
const currentDateEl = document.getElementById('current-date');
const prevDateBtnEl = document.getElementById('prev-date');
const nextDateBtnEl = document.getElementById('next-date');
const todayBtnEl = document.getElementById('today-btn');
const viewCalendarBtnEl = document.getElementById('view-calendar-btn');
const viewArchiveBtnEl = document.getElementById('view-archive-btn');
const viewStarsHistoryBtnEl = document.getElementById('view-stars-history-btn');
const calendarModalEl = document.getElementById('calendar-modal');
const taskDetailModalEl = document.getElementById('task-detail-modal');
const editTaskModalEl = document.getElementById('edit-task-modal');
const editWishModalEl = document.getElementById('edit-wish-modal');
const redeemWishModalEl = document.getElementById('redeem-wish-modal');
const wishArchiveModalEl = document.getElementById('wish-archive-modal');
const wishArchiveListEl = document.getElementById('wish-archive-list');
const starsHistoryModalEl = document.getElementById('stars-history-modal');
const starsHistoryListEl = document.getElementById('stars-history-list');
const editRecurringTaskModalEl = document.getElementById('edit-recurring-task-modal');
const tasksDateTitleEl = document.getElementById('tasks-date-title');
const calendarMonthYearEl = document.getElementById('calendar-month-year');
const calendarDaysEl = document.getElementById('calendar-days');
const prevMonthBtnEl = document.getElementById('prev-month');
const nextMonthBtnEl = document.getElementById('next-month');
const taskDetailDateEl = document.getElementById('task-detail-date');
const taskDetailListEl = document.getElementById('task-detail-list');
const tabBtns = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');
const showResetBtnEl = document.getElementById('show-reset-btn');
const resetConfirmationEl = document.getElementById('reset-confirmation');
const mathQuestionEl = document.getElementById('math-question');
const mathAnswerEl = document.getElementById('math-answer');
const confirmResetBtnEl = document.getElementById('confirm-reset-btn');
const cancelResetBtnEl = document.getElementById('cancel-reset-btn');

// 日期格式化函数
function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// 格式化日期显示（中文）
function formatDateChinese(dateStr) {
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${year}年${month}月${day}日`;
}

// 更新星星总数显示
function updateTotalStars() {
    totalStarsEl.textContent = totalStars;
    localStorage.setItem('totalStars', totalStars);
    
    // 添加动画效果
    totalStarsEl.classList.add('star-added');
    setTimeout(() => {
        totalStarsEl.classList.remove('star-added');
    }, 500);
    
    // 更新所有星愿的可兑换状态
    updateWishRedeemStatus();
}

// 获取当前日期的任务
function getCurrentDateTasks() {
    if (!allTasks[currentDateString]) {
        allTasks[currentDateString] = [];
    }
    return allTasks[currentDateString];
}

// 保存所有任务到本地存储
function saveAllTasks() {
    localStorage.setItem('allTasks', JSON.stringify(allTasks));
}

// 渲染当前日期的任务列表
function renderTasks() {
    const tasks = getCurrentDateTasks();
    taskListEl.innerHTML = '';
    
    // 更新标题显示当前日期
    if (isToday(currentDateString)) {
        tasksDateTitleEl.textContent = '今日任务';
    } else {
        tasksDateTitleEl.textContent = `${formatDateChinese(currentDateString)} 任务`;
    }
    
    if (tasks.length === 0) {
        taskListEl.innerHTML = '<p>这一天还没有任务，快来添加吧！</p>';
        return;
    }
    
    tasks.forEach((task, index) => {
        const taskItem = document.createElement('div');
        taskItem.classList.add('task-item');
        if (task.completed === true) {
            taskItem.classList.add('completed');
        } else if (task.completed === false) {
            // 未处理的任务
        } else if (task.completed === 'failed') {
            taskItem.classList.add('failed');
        }
        
        taskItem.innerHTML = `
            <span class="task-name">${task.name}</span>
            <span class="task-stars">⭐ ${task.stars}</span>
            <div class="task-actions">
                <button class="edit-btn" data-index="${index}">编辑</button>
                ${task.completed !== true && task.completed !== 'failed' ? `
                <div class="task-status-btns">
                    <button class="complete-btn" data-index="${index}">完成</button>
                    <button class="fail-btn" data-index="${index}">未完成</button>
                </div>` : `
                <span class="task-status">${task.completed === true ? '已完成' : '未完成'}</span>
                `}
            </div>
        `;
        
        taskListEl.appendChild(taskItem);
    });
    
    // 添加完成任务的事件监听
    document.querySelectorAll('.complete-btn').forEach(btn => {
        btn.addEventListener('click', completeTask);
    });
    
    // 添加未完成任务的事件监听
    document.querySelectorAll('.fail-btn').forEach(btn => {
        btn.addEventListener('click', failTask);
    });
    
    // 添加编辑任务的事件监听
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', showEditTaskModal);
    });
    
    saveAllTasks();
}

// 渲染星愿列表
function renderWishes() {
    wishListEl.innerHTML = '';
    
    if (wishes.length === 0) {
        wishListEl.innerHTML = '<p>还没有星愿，快来添加吧！</p>';
        return;
    }
    
    wishes.forEach((wish, index) => {
        const wishItem = document.createElement('div');
        wishItem.classList.add('wish-item');
        
        const canRedeem = totalStars >= wish.stars;
        
        wishItem.innerHTML = `
            <span class="wish-name">${wish.name}</span>
            <span class="wish-stars">⭐ ${wish.stars}</span>
            <div class="wish-actions">
                <button class="edit-wish-btn" data-index="${index}">编辑</button>
                <button class="redeem-btn" ${canRedeem ? '' : 'disabled'} data-index="${index}">
                    ${canRedeem ? '兑换' : '星星不足'}
                </button>
            </div>
        `;
        
        wishListEl.appendChild(wishItem);
    });
    
    // 添加兑换星愿的事件监听
    document.querySelectorAll('.redeem-btn').forEach(btn => {
        if (!btn.disabled) {
            btn.addEventListener('click', redeemWish);
        }
    });
    
    // 添加编辑星愿的事件监听
    document.querySelectorAll('.edit-wish-btn').forEach(btn => {
        btn.addEventListener('click', showEditWishModal);
    });
    
    // 保存到本地存储
    localStorage.setItem('wishes', JSON.stringify(wishes));
}

// 更新星愿的可兑换状态
function updateWishRedeemStatus() {
    document.querySelectorAll('.redeem-btn').forEach((btn, index) => {
        const wish = wishes[index];
        if (wish && totalStars >= wish.stars) {
            btn.disabled = false;
            btn.textContent = '兑换';
        } else {
            btn.disabled = true;
            btn.textContent = '星星不足';
        }
    });
}

// 添加新任务
function addTask() {
    const name = newTaskNameEl.value.trim();
    const stars = parseInt(newTaskStarsEl.value);
    
    if (name && stars && stars > 0) {
        const tasks = getCurrentDateTasks();
        const newTask = {
            id: Date.now(),
            name,
            stars,
            completed: false,
            date: currentDateString
        };
        
        tasks.push(newTask);
        renderTasks();
        
        // 清空输入框
        newTaskNameEl.value = '';
        newTaskStarsEl.value = '';
        
        // 显示成功提示
        showNotification('任务添加成功！');
    } else {
        showNotification('请输入有效的任务名称和星星数！', 'error');
    }
}

// 完成任务
function completeTask(event) {
    const index = event.target.dataset.index;
    const tasks = getCurrentDateTasks();
    const task = tasks[index];
    
    if (task.completed !== true && task.completed !== 'failed') {
        task.completed = true;
        totalStars += task.stars;
        
        // 添加星星修改记录
        const record = {
            id: Date.now(),
            type: 'task_complete',
            stars: task.stars,
            reason: `完成任务：${task.name}`,
            date: formatDate(new Date()),
            time: new Date().toLocaleTimeString()
        };
        
        starsHistory.push(record);
        localStorage.setItem('starsHistory', JSON.stringify(starsHistory));
        
        updateTotalStars();
        renderTasks();
        
        // 显示成功提示
        showNotification(`恭喜完成任务！获得 ${task.stars} 颗星星！`);
    }
}

// 未完成任务
function failTask(event) {
    const index = event.target.dataset.index;
    const tasks = getCurrentDateTasks();
    const task = tasks[index];
    
    if (task.completed !== true && task.completed !== 'failed') {
        task.completed = 'failed';
        
        // 添加星星修改记录
        const record = {
            id: Date.now(),
            type: 'task_fail',
            stars: 0,
            reason: `未完成任务：${task.name}`,
            date: formatDate(new Date()),
            time: new Date().toLocaleTimeString()
        };
        
        starsHistory.push(record);
        localStorage.setItem('starsHistory', JSON.stringify(starsHistory));
        
        renderTasks();
        
        // 显示提示
        showNotification('任务标记为未完成，获得0星星');
    }
}

// 添加新星愿
function addWish() {
    const name = newWishNameEl.value.trim();
    const stars = parseInt(newWishStarsEl.value);
    
    if (name && stars && stars > 0) {
        const newWish = {
            id: Date.now(),
            name,
            stars
        };
        
        wishes.push(newWish);
        renderWishes();
        
        // 清空输入框
        newWishNameEl.value = '';
        newWishStarsEl.value = '';
        
        // 显示成功提示
        showNotification('星愿添加成功！');
    } else {
        showNotification('请输入有效的星愿名称和所需星星数！', 'error');
    }
}

// 显示兑换星愿模态框
function redeemWish(event) {
    const index = event.target.dataset.index;
    const wish = wishes[index];
    
    document.getElementById('redeem-wish-name').textContent = wish.name;
    document.getElementById('redeem-wish-stars').textContent = wish.stars;
    document.getElementById('redeem-current-stars').textContent = totalStars;
    document.getElementById('redeem-wish-id').value = index;
    
    // 默认兑换数量为1
    const quantityInput = document.getElementById('redeem-quantity-input');
    quantityInput.value = 1;
    quantityInput.max = Math.floor(totalStars / wish.stars);
    
    // 更新总星星数
    updateRedeemTotal();
    
    redeemWishModalEl.style.display = 'block';
}

// 更新兑换总星星数
function updateRedeemTotal() {
    const index = document.getElementById('redeem-wish-id').value;
    const wish = wishes[index];
    const quantity = parseInt(document.getElementById('redeem-quantity-input').value) || 1;
    const totalRequired = wish.stars * quantity;
    
    document.getElementById('redeem-total-stars').textContent = totalRequired;
    
    // 更新确认按钮状态
    const confirmBtn = document.getElementById('confirm-redeem-btn');
    if (totalRequired <= totalStars) {
        confirmBtn.disabled = false;
    } else {
        confirmBtn.disabled = true;
    }
}

// 确认兑换星愿
function confirmRedeemWish() {
    const index = document.getElementById('redeem-wish-id').value;
    const wish = wishes[index];
    const quantity = parseInt(document.getElementById('redeem-quantity-input').value) || 1;
    const totalRequired = wish.stars * quantity;
    
    if (totalStars >= totalRequired) {
        totalStars -= totalRequired;
        updateTotalStars();
        
        // 添加到已兑换列表
        const redeemedWish = {
            id: Date.now(),
            name: wish.name,
            stars: wish.stars,
            quantity: quantity,
            totalStars: totalRequired,
            date: formatDate(new Date())
        };
        
        redeemedWishes.push(redeemedWish);
        localStorage.setItem('redeemedWishes', JSON.stringify(redeemedWishes));
        
        // 添加星星修改记录
        const record = {
            id: Date.now(),
            type: 'wish_redeem',
            stars: -totalRequired,
            reason: `兑换星愿：${wish.name} x ${quantity}`,
            date: formatDate(new Date()),
            time: new Date().toLocaleTimeString()
        };
        
        starsHistory.push(record);
        localStorage.setItem('starsHistory', JSON.stringify(starsHistory));
        
        closeModals();
        
        // 显示成功提示
        showNotification(`恭喜兑换成功！兑换了 ${quantity} 个 ${wish.name}，消耗了 ${totalRequired} 颗星星！`);
    } else {
        showNotification('星星不足，无法兑换！', 'error');
    }
}

// 添加额外奖励星星
function addBonusStars() {
    const bonusStars = parseInt(bonusStarsEl.value);
    const reason = bonusReasonEl.value.trim() || '家长奖励';
    
    if (bonusStars && bonusStars > 0) {
        totalStars += bonusStars;
        updateTotalStars();
        
        // 添加星星修改记录
        const record = {
            id: Date.now(),
            type: 'bonus',
            stars: bonusStars,
            reason: reason,
            date: formatDate(new Date()),
            time: new Date().toLocaleTimeString()
        };
        
        starsHistory.push(record);
        localStorage.setItem('starsHistory', JSON.stringify(starsHistory));
        
        // 清空输入框
        bonusStarsEl.value = '';
        bonusReasonEl.value = '';
        
        // 显示成功提示
        showNotification(`家长奖励了 ${bonusStars} 颗星星！理由：${reason}`);
    } else {
        showNotification('请输入有效的奖励星星数！', 'error');
    }
}

// 显示编辑任务模态框
function showEditTaskModal(event) {
    const index = event.target.dataset.index;
    const tasks = getCurrentDateTasks();
    const task = tasks[index];
    
    document.getElementById('edit-task-name').value = task.name;
    document.getElementById('edit-task-stars').value = task.stars;
    document.getElementById('edit-task-id').value = index;
    
    editTaskModalEl.style.display = 'block';
}

// 更新任务
function updateTask() {
    const index = parseInt(document.getElementById('edit-task-id').value);
    const name = document.getElementById('edit-task-name').value.trim();
    const stars = parseInt(document.getElementById('edit-task-stars').value);
    
    if (name && stars && stars > 0) {
        const tasks = getCurrentDateTasks();
        
        // 如果任务已完成，并且星星数量有变化，则更新总星星数
        if (tasks[index].completed && tasks[index].stars !== stars) {
            totalStars = totalStars - tasks[index].stars + stars;
            updateTotalStars();
        }
        
        tasks[index].name = name;
        tasks[index].stars = stars;
        
        renderTasks();
        closeModals();
        
        showNotification('任务更新成功！');
    } else {
        showNotification('请输入有效的任务名称和星星数！', 'error');
    }
}

// 删除任务
function deleteTask() {
    const index = parseInt(document.getElementById('edit-task-id').value);
    const tasks = getCurrentDateTasks();
    
    // 如果任务已完成，则减去相应的星星数
    if (tasks[index].completed) {
        totalStars -= tasks[index].stars;
        updateTotalStars();
    }
    
    tasks.splice(index, 1);
    renderTasks();
    closeModals();
    
    showNotification('任务已删除！');
}

// 显示编辑星愿模态框
function showEditWishModal(event) {
    const index = event.target.dataset.index;
    const wish = wishes[index];
    
    document.getElementById('edit-wish-name').value = wish.name;
    document.getElementById('edit-wish-stars').value = wish.stars;
    document.getElementById('edit-wish-id').value = index;
    
    editWishModalEl.style.display = 'block';
}

// 更新星愿
function updateWish() {
    const index = parseInt(document.getElementById('edit-wish-id').value);
    const name = document.getElementById('edit-wish-name').value.trim();
    const stars = parseInt(document.getElementById('edit-wish-stars').value);
    
    if (name && stars && stars > 0) {
        wishes[index].name = name;
        wishes[index].stars = stars;
        
        renderWishes();
        closeModals();
        
        showNotification('星愿更新成功！');
    } else {
        showNotification('请输入有效的星愿名称和所需星星数！', 'error');
    }
}

// 删除星愿
function deleteWish() {
    const index = parseInt(document.getElementById('edit-wish-id').value);
    wishes.splice(index, 1);
    renderWishes();
    closeModals();
    
    showNotification('星愿已删除！');
}

// 关闭所有模态框
function closeModals() {
    calendarModalEl.style.display = 'none';
    taskDetailModalEl.style.display = 'none';
    editTaskModalEl.style.display = 'none';
    editWishModalEl.style.display = 'none';
    redeemWishModalEl.style.display = 'none';
    editRecurringTaskModalEl.style.display = 'none';
    wishArchiveModalEl.style.display = 'none';
    starsHistoryModalEl.style.display = 'none';
    resetConfirmationEl.classList.add('hidden');
}

// 显示日历模态框
function showCalendarModal() {
    renderCalendar(calendarMonth, calendarYear);
    calendarModalEl.style.display = 'block';
}

// 渲染日历
function renderCalendar(month, year) {
    calendarMonthYearEl.textContent = `${year}年${month + 1}月`;
    calendarDaysEl.innerHTML = '';
    
    // 获取当月第一天是星期几（0-6，0表示星期日）
    const firstDay = new Date(year, month, 1).getDay();
    
    // 获取当月的天数
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    // 获取上个月的天数
    const daysInPrevMonth = new Date(year, month, 0).getDate();
    
    // 日历中的总格子数（6行7列）
    const totalCells = 42;
    
    // 填充日历
    for (let i = 0; i < totalCells; i++) {
        const dayCell = document.createElement('div');
        dayCell.classList.add('calendar-day');
        
        // 上个月的日期
        if (i < firstDay) {
            const prevMonthDay = daysInPrevMonth - (firstDay - i) + 1;
            dayCell.textContent = prevMonthDay;
            dayCell.classList.add('other-month');
            
            const prevMonth = month === 0 ? 11 : month - 1;
            const prevYear = month === 0 ? year - 1 : year;
            const dateStr = formatDate(new Date(prevYear, prevMonth, prevMonthDay));
            
            dayCell.dataset.date = dateStr;
            
            // 检查是否有任务
            if (allTasks[dateStr] && allTasks[dateStr].length > 0) {
                dayCell.classList.add('has-tasks');
            }
        }
        // 当月的日期
        else if (i < firstDay + daysInMonth) {
            const day = i - firstDay + 1;
            dayCell.textContent = day;
            
            const dateStr = formatDate(new Date(year, month, day));
            dayCell.dataset.date = dateStr;
            
            // 检查是否是今天
            if (isToday(dateStr)) {
                dayCell.classList.add('today');
            }
            
            // 检查是否有任务
            if (allTasks[dateStr] && allTasks[dateStr].length > 0) {
                dayCell.classList.add('has-tasks');
            }
        }
        // 下个月的日期
        else {
            const nextMonthDay = i - firstDay - daysInMonth + 1;
            dayCell.textContent = nextMonthDay;
            dayCell.classList.add('other-month');
            
            const nextMonth = month === 11 ? 0 : month + 1;
            const nextYear = month === 11 ? year + 1 : year;
            const dateStr = formatDate(new Date(nextYear, nextMonth, nextMonthDay));
            
            dayCell.dataset.date = dateStr;
            
            // 检查是否有任务
            if (allTasks[dateStr] && allTasks[dateStr].length > 0) {
                dayCell.classList.add('has-tasks');
            }
        }
        
        // 添加点击事件
        dayCell.addEventListener('click', function() {
            const clickedDate = this.dataset.date;
            showTaskDetail(clickedDate);
        });
        
        calendarDaysEl.appendChild(dayCell);
    }
}

// 显示某一天的任务详情
function showTaskDetail(dateStr) {
    taskDetailDateEl.textContent = `${formatDateChinese(dateStr)} 任务`;
    
    const tasks = allTasks[dateStr] || [];
    taskDetailListEl.innerHTML = '';
    
    if (tasks.length === 0) {
        taskDetailListEl.innerHTML = '<p>这一天没有任务记录</p>';
    } else {
        tasks.forEach(task => {
            const taskItem = document.createElement('div');
            taskItem.classList.add('task-item');
            if (task.completed) {
                taskItem.classList.add('completed');
            }
            
            taskItem.innerHTML = `
                <span class="task-name">${task.name}</span>
                <span class="task-stars">⭐ ${task.stars}</span>
                <span>${task.completed ? '已完成' : '未完成'}</span>
            `;
            
            taskDetailListEl.appendChild(taskItem);
        });
    }
    
    // 添加切换到该日期的按钮
    const switchDateBtn = document.createElement('button');
    switchDateBtn.textContent = '切换到该日期';
    switchDateBtn.classList.add('switch-date-btn');
    switchDateBtn.style.marginTop = '20px';
    switchDateBtn.addEventListener('click', function() {
        currentDateString = dateStr;
        currentDate = new Date(dateStr);
        currentDateEl.value = dateStr;
        renderTasks();
        closeModals();
    });
    
    taskDetailListEl.appendChild(switchDateBtn);
    
    calendarModalEl.style.display = 'none';
    taskDetailModalEl.style.display = 'block';
}

// 检查日期是否是今天
function isToday(dateStr) {
    const today = formatDate(new Date());
    return dateStr === today;
}

// 切换到上一天
function goToPrevDate() {
    currentDate.setDate(currentDate.getDate() - 1);
    currentDateString = formatDate(currentDate);
    currentDateEl.value = currentDateString;
    renderTasks();
}

// 切换到下一天
function goToNextDate() {
    currentDate.setDate(currentDate.getDate() + 1);
    currentDateString = formatDate(currentDate);
    currentDateEl.value = currentDateString;
    renderTasks();
}

// 切换到今天
function goToToday() {
    currentDate = new Date();
    currentDateString = formatDate(currentDate);
    currentDateEl.value = currentDateString;
    renderTasks();
}

// 日期输入框变化时更新任务列表
function handleDateChange() {
    const selectedDate = currentDateEl.value;
    if (selectedDate) {
        currentDateString = selectedDate;
        currentDate = new Date(selectedDate);
        renderTasks();
    }
}

// 切换到上个月
function goToPrevMonth() {
    calendarMonth--;
    if (calendarMonth < 0) {
        calendarMonth = 11;
        calendarYear--;
    }
    renderCalendar(calendarMonth, calendarYear);
}

// 切换到下个月
function goToNextMonth() {
    calendarMonth++;
    if (calendarMonth > 11) {
        calendarMonth = 0;
        calendarYear++;
    }
    renderCalendar(calendarMonth, calendarYear);
}

// 显示通知
function showNotification(message, type = 'success') {
    // 创建通知元素
    const notification = document.createElement('div');
    notification.classList.add('notification', type);
    notification.textContent = message;
    
    // 添加到页面
    document.body.appendChild(notification);
    
    // 添加样式
    notification.style.position = 'fixed';
    notification.style.bottom = '20px';
    notification.style.right = '20px';
    notification.style.padding = '10px 20px';
    notification.style.borderRadius = '5px';
    notification.style.color = 'white';
    notification.style.fontWeight = 'bold';
    notification.style.zIndex = '1000';
    notification.style.opacity = '0';
    notification.style.transform = 'translateY(20px)';
    notification.style.transition = 'all 0.3s ease';
    
    if (type === 'success') {
        notification.style.backgroundColor = '#00b894';
    } else {
        notification.style.backgroundColor = '#ff6b6b';
    }
    
    // 显示通知
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateY(0)';
    }, 10);
    
    // 3秒后隐藏通知
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateY(20px)';
        
        // 移除元素
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// 生成数学验证题
function generateMathQuestion() {
    const operations = ['+', '-', '*', '/'];
    let num1, num2, operation1, num3, operation2;
    let result;
    
    // 确保第一个操作是乘法或除法
    operation1 = Math.random() < 0.5 ? '*' : '/';
    
    // 确保第二个操作是加法或减法
    operation2 = Math.random() < 0.5 ? '+' : '-';
    
    // 生成数字，确保结果是整数
    if (operation1 === '*') {
        num1 = Math.floor(Math.random() * 9) + 2; // 2-10
        num2 = Math.floor(Math.random() * 9) + 2; // 2-10
        let intermediate = num1 * num2;
        
        if (operation2 === '+') {
            num3 = Math.floor(Math.random() * 20) + 1; // 1-20
            result = intermediate + num3;
        } else { // '-'
            num3 = Math.floor(Math.random() * intermediate) + 1; // 确保结果为正数
            result = intermediate - num3;
        }
    } else { // '/'
        num2 = Math.floor(Math.random() * 9) + 2; // 2-10
        let intermediate = Math.floor(Math.random() * 9) + 2; // 2-10
        num1 = intermediate * num2; // 确保能整除
        
        if (operation2 === '+') {
            num3 = Math.floor(Math.random() * 20) + 1; // 1-20
            result = intermediate + num3;
        } else { // '-'
            num3 = Math.floor(Math.random() * intermediate) + 1; // 确保结果为正数
            result = intermediate - num3;
        }
    }
    
    const question = `${num1} ${operation1} ${num2} ${operation2} ${num3} = ?`;
    return { question, result };
}

// 显示初始化确认
function showResetConfirmation() {
    // 生成数学验证题
    const { question, result } = generateMathQuestion();
    mathQuestionEl.textContent = question;
    mathQuestionEl.dataset.result = result;
    mathAnswerEl.value = '';
    
    resetConfirmationEl.classList.remove('hidden');
}

// 验证答案并初始化应用
function verifyAndReset() {
    const correctResult = parseInt(mathQuestionEl.dataset.result);
    const userAnswer = parseInt(mathAnswerEl.value);
    
    if (userAnswer === correctResult) {
        // 清除所有数据
        allTasks = {};
        wishes = [];
        recurringTasks = [];
        redeemedWishes = [];
        starsHistory = [];
        totalStars = 0;
        
        // 更新本地存储
        localStorage.removeItem('allTasks');
        localStorage.removeItem('wishes');
        localStorage.removeItem('recurringTasks');
        localStorage.removeItem('redeemedWishes');
        localStorage.removeItem('starsHistory');
        localStorage.removeItem('totalStars');
        
        // 清除备份数据
        localStorage.removeItem('backupData');
        localStorage.removeItem('lastBackupDate');
        
        // 清除自动备份
        for (let i = localStorage.length - 1; i >= 0; i--) {
            const key = localStorage.key(i);
            if (key && key.startsWith('autoBackup_')) {
                localStorage.removeItem(key);
            }
        }
        
        // 重新渲染界面
        renderTasks();
        renderWishes();
        renderRecurringTasks();
        updateTotalStars();
        
        // 关闭确认框
        resetConfirmationEl.classList.add('hidden');
        
        showNotification('应用已成功初始化！');
    } else {
        showNotification('答案错误，请重新计算！', 'error');
    }
}

// 添加示例数据（首次使用时）
function addSampleData() {
    if (Object.keys(allTasks).length === 0 && wishes.length === 0 && recurringTasks.length === 0 && totalStars === 0) {
        // 添加今天的示例任务
        const today = formatDate(new Date());
        allTasks[today] = [
            { id: 1, name: '完成数学作业', stars: 3, completed: false, date: today },
            { id: 2, name: '阅读15分钟', stars: 2, completed: false, date: today },
            { id: 3, name: '整理书包', stars: 1, completed: false, date: today }
        ];
        
        // 添加示例星愿
        wishes = [
            { id: 1, name: '看30分钟动画片', stars: 5 },
            { id: 2, name: '去公园玩', stars: 10 },
            { id: 3, name: '买新玩具', stars: 20 }
        ];
        
        // 添加示例周期性目标
        recurringTasks = [
            { id: 101, name: '每天阅读20分钟', stars: 2 },
            { id: 102, name: '整理自己的床铺', stars: 1 },
            { id: 103, name: '练习写字', stars: 2 }
        ];
        
        // 更新界面
        saveAllTasks();
        localStorage.setItem('wishes', JSON.stringify(wishes));
        localStorage.setItem('recurringTasks', JSON.stringify(recurringTasks));
    }
}

// 选项卡切换
function switchTab(tabId) {
    tabBtns.forEach(btn => {
        if (btn.dataset.tab === tabId) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    
    tabContents.forEach(content => {
        if (content.id === tabId) {
            content.classList.add('active');
        } else {
            content.classList.remove('active');
        }
    });
    
    // 切换选项卡时刷新对应的内容
    if (tabId === 'daily-tasks') {
        renderTasks();
    } else if (tabId === 'recurring-tasks') {
        renderRecurringTasks();
    }
}

// 渲染周期性任务列表
function renderRecurringTasks() {
    recurringTaskListEl.innerHTML = '';
    
    if (recurringTasks.length === 0) {
        recurringTaskListEl.innerHTML = '<p>还没有周期性目标，快来添加吧！</p>';
        return;
    }
    
    recurringTasks.forEach((task, index) => {
        const taskItem = document.createElement('div');
        taskItem.classList.add('task-item');
        
        taskItem.innerHTML = `
            <span class="task-name">${task.name}</span>
            <span class="task-stars">⭐ ${task.stars}</span>
            <div class="task-actions">
                <button class="add-to-today-btn" data-index="${index}">添加到选择日期</button>
                <button class="edit-recurring-btn" data-index="${index}">编辑</button>
            </div>
        `;
        
        recurringTaskListEl.appendChild(taskItem);
    });
    
    // 添加编辑周期性任务的事件监听
    document.querySelectorAll('.edit-recurring-btn').forEach(btn => {
        btn.addEventListener('click', showEditRecurringTaskModal);
    });
    
    // 添加“添加到当天”按钮的事件监听
    document.querySelectorAll('.add-to-today-btn').forEach(btn => {
        btn.addEventListener('click', addRecurringTaskToSelectedDate);
    });
    
    // 保存到本地存储
    localStorage.setItem('recurringTasks', JSON.stringify(recurringTasks));
}

// 添加周期性任务
function addRecurringTask() {
    const name = newRecurringTaskNameEl.value.trim();
    const stars = parseInt(newRecurringTaskStarsEl.value);
    
    if (name && stars && stars > 0) {
        const newTask = {
            id: Date.now(),
            name,
            stars
        };
        
        recurringTasks.push(newTask);
        localStorage.setItem('recurringTasks', JSON.stringify(recurringTasks));
        renderRecurringTasks();
        
        // 将新的周期任务添加到今天的任务列表中
        const today = formatDate(new Date());
        if (!allTasks[today]) {
            allTasks[today] = [];
        }
        
        const dailyTask = {
            id: Date.now() + Math.random(),
            name: newTask.name,
            stars: newTask.stars,
            completed: false,
            date: today,
            isRecurring: true,
            recurringId: newTask.id
        };
        
        allTasks[today].push(dailyTask);
        saveAllTasks();
        
        // 如果当前显示的是今天的任务，则刷新任务列表
        if (currentDateString === today) {
            renderTasks();
        }
        
        // 清空输入框
        newRecurringTaskNameEl.value = '';
        newRecurringTaskStarsEl.value = '';
        
        // 显示成功提示
        showNotification('周期性目标添加成功！已添加到今日任务中');
    } else {
        showNotification('请输入有效的目标名称和星星数！', 'error');
    }
}

// 显示编辑周期性任务模态框
function showEditRecurringTaskModal(event) {
    const index = event.target.dataset.index;
    const task = recurringTasks[index];
    
    document.getElementById('edit-recurring-task-name').value = task.name;
    document.getElementById('edit-recurring-task-stars').value = task.stars;
    document.getElementById('edit-recurring-task-id').value = index;
    
    editRecurringTaskModalEl.style.display = 'block';
}

// 更新周期性任务
function updateRecurringTask() {
    const index = parseInt(document.getElementById('edit-recurring-task-id').value);
    const name = document.getElementById('edit-recurring-task-name').value.trim();
    const stars = parseInt(document.getElementById('edit-recurring-task-stars').value);
    
    if (name && stars && stars > 0) {
        const recurringId = recurringTasks[index].id;
        recurringTasks[index].name = name;
        recurringTasks[index].stars = stars;
        
        // 保存周期性任务
        localStorage.setItem('recurringTasks', JSON.stringify(recurringTasks));
        renderRecurringTasks();
        
        // 更新今天的周期性任务
        const today = formatDate(new Date());
        if (allTasks[today]) {
            let updated = false;
            allTasks[today].forEach(task => {
                if (task.isRecurring && task.recurringId === recurringId) {
                    task.name = name;
                    task.stars = stars;
                    updated = true;
                }
            });
            
            if (updated) {
                saveAllTasks();
                
                // 如果当前显示的是今天的任务，则刷新任务列表
                if (currentDateString === selectedDate) {
                    renderTasks();
                }
            }
        }
        
        closeModals();
        showNotification('周期性目标更新成功！');
    } else {
        showNotification('请输入有效的目标名称和星星数！', 'error');
    }
}

// 删除周期性任务
function deleteRecurringTask() {
    const index = parseInt(document.getElementById('edit-recurring-task-id').value);
    const recurringId = recurringTasks[index].id;
    
    recurringTasks.splice(index, 1);
    localStorage.setItem('recurringTasks', JSON.stringify(recurringTasks));
    renderRecurringTasks();
    
    // 从今天的任务列表中删除相应的周期性任务
    const today = formatDate(new Date());
    if (allTasks[today]) {
        const initialLength = allTasks[today].length;
        allTasks[today] = allTasks[today].filter(task => !(task.isRecurring && task.recurringId === recurringId));
        
        if (allTasks[today].length !== initialLength) {
            saveAllTasks();
            
            // 如果当前显示的是今天的任务，则刷新任务列表
            if (currentDateString === selectedDate) {
                renderTasks();
            }
        }
    }
    
    closeModals();
    showNotification('周期性目标已删除！');
}

// 生成当天的周期性任务
function generateDailyRecurringTasks() {
    const today = formatDate(new Date());
    
    if (!allTasks[today]) {
        allTasks[today] = [];
    }
    
    // 获取已经存在的周期性任务ID
    const existingRecurringIds = allTasks[today]
        .filter(task => task.isRecurring)
        .map(task => task.recurringId);
    
    // 添加尚未生成的周期性任务
    let addedNewTasks = false;
    
    recurringTasks.forEach(recurringTask => {
        // 检查该周期性任务是否已经存在于今天的任务列表中
        if (!existingRecurringIds.includes(recurringTask.id)) {
            const newTask = {
                id: Date.now() + Math.random(),
                name: recurringTask.name,
                stars: recurringTask.stars,
                completed: false,
                date: today,
                isRecurring: true,
                recurringId: recurringTask.id
            };
            
            allTasks[today].push(newTask);
            addedNewTasks = true;
        }
    });
    
    if (addedNewTasks) {
        saveAllTasks();
        
        // 如果当前显示的是今天的任务，则刷新任务列表
        if (currentDateString === today) {
            renderTasks();
        }
    }
    
    return addedNewTasks;
}

// 事件监听
addTaskBtnEl.addEventListener('click', addTask);
addRecurringTaskBtnEl.addEventListener('click', addRecurringTask);
addWishBtnEl.addEventListener('click', addWish);
addBonusBtnEl.addEventListener('click', addBonusStars);
prevDateBtnEl.addEventListener('click', goToPrevDate);
nextDateBtnEl.addEventListener('click', goToNextDate);
todayBtnEl.addEventListener('click', goToToday);
currentDateEl.addEventListener('change', handleDateChange);
viewCalendarBtnEl.addEventListener('click', showCalendarModal);
prevMonthBtnEl.addEventListener('click', goToPrevMonth);
nextMonthBtnEl.addEventListener('click', goToNextMonth);

// 选项卡切换事件
tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        switchTab(btn.dataset.tab);
    });
});

// 关闭模态框的事件监听
document.querySelectorAll('.close-modal').forEach(closeBtn => {
    closeBtn.addEventListener('click', closeModals);
});

// 点击模态框外部关闭模态框
window.addEventListener('click', function(event) {
    if (event.target === calendarModalEl) {
        calendarModalEl.style.display = 'none';
    }
    if (event.target === taskDetailModalEl) {
        taskDetailModalEl.style.display = 'none';
    }
    if (event.target === editTaskModalEl) {
        editTaskModalEl.style.display = 'none';
    }
    if (event.target === editWishModalEl) {
        editWishModalEl.style.display = 'none';
    }
    if (event.target === redeemWishModalEl) {
        redeemWishModalEl.style.display = 'none';
    }
    if (event.target === editRecurringTaskModalEl) {
        editRecurringTaskModalEl.style.display = 'none';
    }
    if (event.target === wishArchiveModalEl) {
        wishArchiveModalEl.style.display = 'none';
    }
    if (event.target === starsHistoryModalEl) {
        starsHistoryModalEl.style.display = 'none';
    }
});

// 编辑任务按钮的事件监听
document.getElementById('update-task-btn').addEventListener('click', updateTask);
document.getElementById('delete-task-btn').addEventListener('click', deleteTask);

// 编辑星愿按钮的事件监听
document.getElementById('update-wish-btn').addEventListener('click', updateWish);
document.getElementById('delete-wish-btn').addEventListener('click', deleteWish);

// 编辑周期性任务按钮的事件监听
document.getElementById('update-recurring-task-btn').addEventListener('click', updateRecurringTask);
document.getElementById('delete-recurring-task-btn').addEventListener('click', deleteRecurringTask);

// 显示已兑换心愿归档
function showWishArchive() {
    wishArchiveListEl.innerHTML = '';
    
    if (redeemedWishes.length === 0) {
        wishArchiveListEl.innerHTML = '<p>还没有兑换过星愿，快去完成任务获取星星吧！</p>';
    } else {
        // 按日期降序排序，最新的在前面
        redeemedWishes.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        redeemedWishes.forEach(wish => {
            const wishItem = document.createElement('div');
            wishItem.classList.add('wish-item', 'redeemed-wish');
            
            wishItem.innerHTML = `
                <div class="wish-info">
                    <span class="wish-name">${wish.name} x ${wish.quantity}</span>
                    <span class="wish-date">${formatDateChinese(wish.date)}</span>
                </div>
                <span class="wish-stars">⭐ ${wish.totalStars}</span>
            `;
            
            wishArchiveListEl.appendChild(wishItem);
        });
    }
    
    wishArchiveModalEl.style.display = 'block';
}

// 兑换星愿数量相关事件
document.getElementById('decrease-quantity').addEventListener('click', function() {
    const input = document.getElementById('redeem-quantity-input');
    if (parseInt(input.value) > 1) {
        input.value = parseInt(input.value) - 1;
        updateRedeemTotal();
    }
});

document.getElementById('increase-quantity').addEventListener('click', function() {
    const input = document.getElementById('redeem-quantity-input');
    const max = parseInt(input.max);
    if (parseInt(input.value) < max) {
        input.value = parseInt(input.value) + 1;
        updateRedeemTotal();
    }
});

document.getElementById('redeem-quantity-input').addEventListener('change', updateRedeemTotal);
document.getElementById('confirm-redeem-btn').addEventListener('click', confirmRedeemWish);
document.getElementById('cancel-redeem-btn').addEventListener('click', closeModals);

// 查看已兑换心愿归档
viewArchiveBtnEl.addEventListener('click', showWishArchive);

// 将周期性任务添加到选择的日期
function addRecurringTaskToSelectedDate(event) {
    const index = event.target.dataset.index;
    const recurringTask = recurringTasks[index];
    const selectedDate = currentDateEl.value; // 使用用户选择的日期
    
    // 检查选择日期的任务列表中是否已经有该周期性任务
    if (!allTasks[selectedDate]) {
        allTasks[selectedDate] = [];
    }
    
    // 检查是否已存在相同的周期性任务
    const existingTask = allTasks[selectedDate].find(task => 
        task.isRecurring && task.recurringId === recurringTask.id
    );
    
    if (existingTask) {
        showNotification('该周期性任务已经存在于选择日期的任务列表中！', 'error');
        return;
    }
    
    // 添加到选择日期的任务列表
    const newTask = {
        id: Date.now() + Math.random(),
        name: recurringTask.name,
        stars: recurringTask.stars,
        completed: false,
        date: selectedDate,
        isRecurring: true,
        recurringId: recurringTask.id
    };
    
    allTasks[selectedDate].push(newTask);
    saveAllTasks();
    
    // 如果当前显示的是选择的日期的任务，则刷新任务列表
    if (currentDateString === selectedDate) {
        renderTasks();
    }
    
    const dateText = selectedDate === formatDate(new Date()) ? "今天" : formatDateChinese(new Date(selectedDate));
    showNotification(`周期性任务 "${recurringTask.name}" 已添加到${dateText}的任务列表中！`);
}

// 显示星星修改记录
function showStarsHistory() {
    starsHistoryListEl.innerHTML = '';
    
    if (starsHistory.length === 0) {
        starsHistoryListEl.innerHTML = '<p>还没有星星修改记录</p>';
    } else {
        // 按日期和时间降序排序，最新的在前面
        starsHistory.sort((a, b) => {
            if (a.date !== b.date) {
                return new Date(b.date) - new Date(a.date);
            }
            return b.time.localeCompare(a.time);
        });
        
        starsHistory.forEach(record => {
            const recordItem = document.createElement('div');
            recordItem.classList.add('history-item');
            
            // 根据记录类型设置不同的样式
            if (record.type === 'bonus') {
                recordItem.classList.add('bonus-record');
            } else if (record.type === 'task_complete') {
                recordItem.classList.add('complete-record');
            } else if (record.type === 'task_fail') {
                recordItem.classList.add('fail-record');
            } else if (record.type === 'wish_redeem') {
                recordItem.classList.add('redeem-record');
            }
            
            const starsChange = record.stars > 0 ? `+${record.stars}` : record.stars;
            const starsClass = record.stars >= 0 ? 'positive-stars' : 'negative-stars';
            
            recordItem.innerHTML = `
                <div class="record-info">
                    <span class="record-reason">${record.reason}</span>
                    <span class="record-date">${record.date} ${record.time}</span>
                </div>
                <span class="record-stars ${starsClass}">⭐ ${starsChange}</span>
            `;
            
            starsHistoryListEl.appendChild(recordItem);
        });
    }
    
    starsHistoryModalEl.style.display = 'block';
}

// 查看星星修改记录
viewStarsHistoryBtnEl.addEventListener('click', showStarsHistory);

// 数据备份与恢复相关事件
const exportDataBtnEl = document.getElementById('export-data-btn');
const importDataBtnEl = document.getElementById('import-data-btn');
const importFileEl = document.getElementById('import-file');

exportDataBtnEl.addEventListener('click', exportData);
importDataBtnEl.addEventListener('click', function() {
    importFileEl.click();
});
importFileEl.addEventListener('change', importData);

// 初始化相关事件
showResetBtnEl.addEventListener('click', showResetConfirmation);
confirmResetBtnEl.addEventListener('click', verifyAndReset);
cancelResetBtnEl.addEventListener('click', function() {
    resetConfirmationEl.classList.add('hidden');
});

// 数据导出功能
function exportData() {
    // 收集所有需要导出的数据
    const exportData = {
        allTasks: allTasks,
        wishes: wishes,
        totalStars: totalStars,
        recurringTasks: recurringTasks,
        redeemedWishes: redeemedWishes,
        starsHistory: starsHistory,
        timestamp: new Date().getTime(),
        version: '1.0'
    };
    
    // 将数据转换为JSON字符串
    const dataStr = JSON.stringify(exportData);
    
    // 创建下载链接
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    // 创建下载链接元素
    const exportFileDefaultName = '小星星学习打卡数据_' + formatDate(new Date()) + '.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    // 同时保存一份到localStorage作为备份
    saveAllData();
}

// 数据导入功能
function importData(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const importedData = JSON.parse(e.target.result);
            
            // 验证数据格式
            if (!importedData.version || !importedData.allTasks || !importedData.wishes) {
                alert('导入的数据格式不正确');
                return;
            }
            
            // 确认导入
            if (confirm('确定要导入数据吗？这将覆盖当前所有数据。')) {
                // 导入数据
                allTasks = importedData.allTasks || {};
                wishes = importedData.wishes || [];
                totalStars = importedData.totalStars || 0;
                recurringTasks = importedData.recurringTasks || [];
                redeemedWishes = importedData.redeemedWishes || [];
                starsHistory = importedData.starsHistory || [];
                
                // 保存到localStorage
                saveAllData();
                
                // 重新渲染页面
                renderTasks();
                renderWishes();
                renderRecurringTasks();
                updateTotalStars();
                
                alert('数据导入成功！');
            }
        } catch (error) {
            alert('导入数据时出错: ' + error.message);
        }
        
        // 清空文件输入框，允许重新选择同一文件
        event.target.value = '';
    };
    
    reader.readAsText(file);
}

// 保存所有数据到localStorage并创建备份
function saveAllData() {
    try {
        // 保存所有数据
        localStorage.setItem('allTasks', JSON.stringify(allTasks));
        localStorage.setItem('wishes', JSON.stringify(wishes));
        localStorage.setItem('totalStars', totalStars);
        localStorage.setItem('recurringTasks', JSON.stringify(recurringTasks));
        localStorage.setItem('redeemedWishes', JSON.stringify(redeemedWishes));
        localStorage.setItem('starsHistory', JSON.stringify(starsHistory));
        
        // 创建备份数据
        const backupData = {
            allTasks: allTasks,
            wishes: wishes,
            totalStars: totalStars,
            recurringTasks: recurringTasks,
            redeemedWishes: redeemedWishes,
            starsHistory: starsHistory,
            timestamp: new Date().getTime(),
            version: '1.0'
        };
        
        // 保存完整备份
        localStorage.setItem('backupData', JSON.stringify(backupData));
        
        // 每天自动创建一个备份
        const today = formatDate(new Date());
        const lastBackupDate = localStorage.getItem('lastBackupDate');
        
        if (lastBackupDate !== today) {
            localStorage.setItem('autoBackup_' + today, JSON.stringify(backupData));
            localStorage.setItem('lastBackupDate', today);
            
            // 保留最近7天的自动备份
            cleanupOldBackups();
        }
        
        return true;
    } catch (error) {
        console.error('保存数据失败:', error);
        alert('数据保存失败，请尝试导出数据进行备份！');
        return false;
    }
}

// 清理旧的自动备份
function cleanupOldBackups() {
    try {
        const MAX_BACKUPS = 7; // 保留最近7天的备份
        const backupKeys = [];
        
        // 收集所有自动备份的键
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('autoBackup_')) {
                backupKeys.push({
                    key: key,
                    date: key.replace('autoBackup_', '')
                });
            }
        }
        
        // 按日期排序（从新到旧）
        backupKeys.sort((a, b) => b.date.localeCompare(a.date));
        
        // 删除超过限制的旧备份
        if (backupKeys.length > MAX_BACKUPS) {
            for (let i = MAX_BACKUPS; i < backupKeys.length; i++) {
                localStorage.removeItem(backupKeys[i].key);
            }
        }
    } catch (error) {
        console.error('清理旧备份失败:', error);
    }
}

// 尝试从备份恢复数据
function tryRecoverFromBackup() {
    try {
        // 首先检查是否有主备份
        const backupData = localStorage.getItem('backupData');
        if (backupData) {
            const parsedBackup = JSON.parse(backupData);
            if (parsedBackup && parsedBackup.allTasks) {
                console.log('从主备份恢复数据');
                allTasks = parsedBackup.allTasks;
                wishes = parsedBackup.wishes || [];
                totalStars = parsedBackup.totalStars || 0;
                recurringTasks = parsedBackup.recurringTasks || [];
                redeemedWishes = parsedBackup.redeemedWishes || [];
                starsHistory = parsedBackup.starsHistory || [];
                return true;
            }
        }
        
        // 如果没有主备份，尝试从自动备份恢复
        const backupKeys = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('autoBackup_')) {
                backupKeys.push(key);
            }
        }
        
        if (backupKeys.length > 0) {
            // 按日期排序（从新到旧）
            backupKeys.sort((a, b) => b.replace('autoBackup_', '').localeCompare(a.replace('autoBackup_', '')));
            
            // 尝试最新的备份
            const latestBackup = localStorage.getItem(backupKeys[0]);
            if (latestBackup) {
                const parsedBackup = JSON.parse(latestBackup);
                if (parsedBackup && parsedBackup.allTasks) {
                    console.log('从自动备份恢复数据: ' + backupKeys[0]);
                    allTasks = parsedBackup.allTasks;
                    wishes = parsedBackup.wishes || [];
                    totalStars = parsedBackup.totalStars || 0;
                    recurringTasks = parsedBackup.recurringTasks || [];
                    redeemedWishes = parsedBackup.redeemedWishes || [];
                    starsHistory = parsedBackup.starsHistory || [];
                    return true;
                }
            }
        }
        
        return false;
    } catch (error) {
        console.error('恢复备份失败:', error);
        return false;
    }
}

// 初始化应用
function initApp() {
    // 设置日期选择器为今天
    currentDateEl.value = currentDateString;
    
    // 尝试从备份恢复数据
    if (Object.keys(allTasks).length === 0) {
        if (tryRecoverFromBackup()) {
            console.log('数据已从备份恢复');
            // 重新保存所有数据
            saveAllData();
        }
    }
    
    // 生成当天的周期性任务
    generateDailyRecurringTasks();
    
    renderTasks();
    renderWishes();
    renderRecurringTasks();
    updateTotalStars();
    addSampleData();
    
    // 创建每日自动备份
    saveAllData();
}

// 启动应用
initApp();

// 注册Service Worker并强制更新
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // 注册service worker
        navigator.serviceWorker.register('./service-worker.js')
            .then(registration => {
                console.log('ServiceWorker registration successful with scope: ', registration.scope);
                
                // 检查更新
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed') {
                            if (navigator.serviceWorker.controller) {
                                console.log('新版本可用，正在更新...');
                                // 强制更新
                                newWorker.postMessage({ action: 'skipWaiting' });
                            }
                        }
                    });
                });
            })
            .catch(err => {
                console.log('ServiceWorker registration failed: ', err);
            });
            
        // 当service worker更新完成后，刷新页面
        let refreshing = false;
        navigator.serviceWorker.addEventListener('controllerchange', () => {
            if (!refreshing) {
                refreshing = true;
                console.log('正在刷新页面...');
                window.location.reload();
            }
        });
    });
}