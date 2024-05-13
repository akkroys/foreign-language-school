document.addEventListener('DOMContentLoaded', async function () {
    const addCourseBtn = document.querySelector('.add-btn button');
    const modal = document.getElementById('addCourseModal');
    const editModal = document.getElementById('editCourseModal');
    const deleteModal = document.getElementById('deleteConfirmModal');
    const closeButtons = document.querySelectorAll('.modal-content .close');
    const saveCourseBtn = document.querySelector('.save-course-btn');
    const saveEditCourseBtn = document.querySelector('.save-edit-course-btn');
    const cancelCourseBtn = document.querySelector('.cancel-course-btn');
    const cancelEditCourseBtn = document.querySelector('.cancel-edit-course-btn');
    const coursesList = document.querySelector('.courses-list');
    const courseGoalSelect = document.querySelector('select[name="courseGoal"]');
    const editCourseGoalSelect = document.querySelector('select[name="editCourseGoal"]');
    const cancelDeleteBtn = document.querySelector('.cancel-delete-btn');
    const confirmDeleteBtn = document.querySelector('.confirm-delete-btn');
    const searchButton = document.querySelector('#search-btn');
    const searchInput = document.querySelector('#course-search');

    const clearForm = (form) => {
        form.querySelectorAll('input, select').forEach((field) => {
            field.value = '';
        });
    };

    const loadGoals = async () => {
        const response = await fetch('/api/courses/goals');
        if (!response.ok) {
            throw new Error(`Ошибка: ${response.status}`);
        }
        const goals = await response.json();

        courseGoalSelect.innerHTML = '';
        editCourseGoalSelect.innerHTML = '';

        goals.forEach((goal) => {
            const option = document.createElement('option');
            option.value = goal.id;
            option.textContent = goal.title;
            courseGoalSelect.appendChild(option);
        });

        goals.forEach((goal) => {
            const option = document.createElement('option');
            option.value = goal.id;
            option.textContent = goal.title;
            editCourseGoalSelect.appendChild(option);
        });
    };

    await loadGoals();

    addCourseBtn.addEventListener('click', function () {
        clearForm(modal.querySelector('.modal-content'));
        modal.style.display = 'block';
    });

    closeButtons.forEach(closeButton => {
        closeButton.addEventListener('click', function () {
            const modalContent = event.target.closest('.modal-content');
            const modalToClose = modalContent.closest('.modal');
            modalToClose.style.display = 'none';
            clearForm(modalContent);
        });
    });

    cancelCourseBtn.addEventListener('click', function () {
        modal.style.display = 'none';
        clearForm(modal.querySelector('.modal-content'));
    });

    cancelEditCourseBtn.addEventListener('click', function () {
        editModal.style.display = 'none';
        clearForm(editModal.querySelector('.modal-content'));
    });

    cancelDeleteBtn.addEventListener('click', function () {
        deleteModal.style.display = 'none';
    });

    window.addEventListener('click', function (event) {
        const modals = [modal, editModal, deleteModal];
        modals.forEach((modal) => {
            if (event.target === modal) {
                modal.style.display = 'none';
                clearForm(modal.querySelector('.modal-content'));
            }
        });
    });

    saveCourseBtn.addEventListener('click', async () => {
        const courseName = document.querySelector('input[name="courseName"]').value;
        const courseGoal = document.querySelector('select[name="courseGoal"]').value;

        const response = await fetch('/api/courses', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                title: courseName,
                goalId: courseGoal
            })
        });

        if (response.ok) {
            modal.style.display = 'none';
            clearForm(modal.querySelector('.modal-content'));
            loadCourses();
        } else {
            console.error('Ошибка добавления курса:', response.statusText);
        }
    });

    saveEditCourseBtn.addEventListener('click', async () => {
        const courseId = editModal.getAttribute('data-course-id');
        const courseName = document.querySelector('input[name="editCourseName"]').value;
        const courseGoal = document.querySelector('select[name="editCourseGoal"]').value;

        const response = await fetch(`/api/courses/${courseId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                title: courseName,
                goalId: courseGoal
            })
        });

        if (response.ok) {
            editModal.style.display = 'none';
            clearForm(editModal.querySelector('.modal-content'));
            loadCourses();
        } else {
            console.error('Ошибка редактирования курса:', response.statusText);
        }
    });

    confirmDeleteBtn.addEventListener('click', async () => {
        const courseId = deleteModal.getAttribute('data-course-id');

        const response = await fetch(`/api/courses/${courseId}`, {
            method: 'DELETE',
        });

        if (response.ok) {
            loadCourses();
        } else {
            console.error('Ошибка удаления курса:', response.statusText);
        }

        deleteModal.style.display = 'none';
    });

    const loadCourses = async (query = '') => { // Опциональный параметр для поиска
        let url = '/api/courses';
        if (query) {
            url += `/search?query=${query}`; // Если есть запрос, добавляем в URL
        }
        
        const response = await fetch(url);
        if (!response.ok) {
            console.error(`Ошибка загрузки курсов: ${response.statusText}`);
            return;
        }

        const courses = await response.json();
        coursesList.innerHTML = '';

        courses.forEach((course) => {
            const courseItem = document.createElement('div');
            courseItem.className = 'course-item';
            courseItem.innerHTML = `
                <div class="course-tile">
                    <h3>${course.title}</h3>
                    <div class="course-actions">
                        <button class="edit-course-btn">Редактировать</button>
                        <button class="delete-course-btn">Удалить</button>
                    </div>
                </div>
            `;

            coursesList.appendChild(courseItem);

            const editBtn = courseItem.querySelector('.edit-course-btn');
            editBtn.addEventListener('click', () => {
                const courseId = course.id;
                editModal.setAttribute('data-course-id', courseId);

                const courseNameInput = editModal.querySelector('input[name="editCourseName"]');
                courseNameInput.value = course.title;

                const courseGoalSelect = editCourseGoalSelect;
                courseGoalSelect.value = course.goalId;

                editModal.style.display = 'block';
                clearForm(editModal.querySelector('.modal-content'));
            });

            const deleteBtn = courseItem.querySelector('.delete-course-btn');
            deleteBtn.addEventListener('click', () => {
                deleteModal.setAttribute('data-course-id', course.id);
                deleteModal.style.display = 'block';
            });
        });
    };

    searchButton.addEventListener('click', () => {
        const query = searchInput.value;
        loadCourses(query);
    });

    loadCourses();
});