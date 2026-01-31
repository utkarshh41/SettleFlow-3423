import { Route, Switch } from "wouter";
import Index from "./pages/index";
import ActivityPage from "./pages/activity";
import TasksPage from "./pages/tasks";
import CustomersPage from "./pages/customers";
import CustomerEmailsPage from "./pages/customer-emails";
import { Provider } from "./components/provider";

function App() {
  return (
    <Provider>
      <Switch>
        <Route path="/" component={Index} />
        <Route path="/activity" component={ActivityPage} />
        <Route path="/tasks" component={TasksPage} />
        <Route path="/customers" component={CustomersPage} />
        <Route path="/customer-emails" component={CustomerEmailsPage} />
      </Switch>
    </Provider>
  );
}

export default App;
