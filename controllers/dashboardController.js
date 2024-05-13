export const dashboardView = (req, res) => {
    const user = req.user;

    let dashboardTemplate;
    if (user.role === 'admin') {
        dashboardTemplate = 'adminDashboard';
    } else if (user.role === 'tutor') {
        dashboardTemplate = 'tutorDashboard';
    } else {
        dashboardTemplate = 'userDashboard';
    }

    res.render(dashboardTemplate, { user: user });
};