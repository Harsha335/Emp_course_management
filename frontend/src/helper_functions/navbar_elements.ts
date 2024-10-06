export const adminNavbarComponents = {
    title: 'Admin',
    routes: [
        {
            name: 'dashboard',
            icons: (await import('@mui/icons-material/Dashboard')).default,
            url: '/admin/dashboard'
        },
        {
            name: 'All Courses',
            icons: (await import('@mui/icons-material/Apps')).default,
            url: '/admin/allCourses',
        },
        {
            name: 'Add Course',
            icons: (await import('@mui/icons-material/NoteAdd')).default,
            url: '/admin/addCourse',
        },
        {
            name: 'Add Questions',
            icons: (await import('@mui/icons-material/Quiz')).default,
            url: '/admin/addQuestions',
        },
        {
            name: 'Employee Report',  // think of making it a popup
            icons: (await import('@mui/icons-material/Assignment')).default,
            url: '/admin/employeeReport',
        },
        {
            name: 'Notifications',
            icons: (await import('@mui/icons-material/CircleNotifications')).default,
            url: '/admin/notifications',
        }
    ]
}
export const employeeNavbarComponents = {
    title: 'Employee Course Management',
    routes: [
        {
            name: 'dashboard',
            icons: (await import('@mui/icons-material/Dashboard')).default,
            url: '/dashboard'
        },
        {
            name: 'Assigned Courses',
            icons: (await import('@mui/icons-material/Assignment')).default,
            url: '/courses',
        }
    ]
}