import { RouterProvider, createRouter, createRootRoute, createRoute } from '@tanstack/react-router'
import App from './App'
import ExpensesList from './routes/expenses.list'
import AddExpenseForm from './routes/expenses.new'
import ExpenseDetail from './routes/expenses.detail'
import { AuthBar } from './components/AuthBar'

const rootRoute = createRootRoute({
  component: () => <App />,
})

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: () => <p>Home Page</p>,
})

export const expensesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/expenses',
  component: () => <ExpensesList/>
})
export const expenseRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/expenses/$id',
  component: () => <ExpenseDetail/>
})
const expenseNewRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/expenses/new',
  component: () => <AddExpenseForm/>
})

const routeTree = rootRoute.addChildren([indexRoute, expensesRoute,expenseNewRoute,expenseRoute,])
export const router = createRouter({ routeTree })

router.update({
  defaultNotFoundComponent: () => <p>Page not found</p>,
  defaultErrorComponent: ({ error }) => <p>Error: {(error as Error).message}</p>,
})

export function AppRouter() {
  return <RouterProvider router={router} />
}
