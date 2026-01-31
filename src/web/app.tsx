import { Route, Switch } from "wouter";
import Index from "./pages/index";
import ActivityPage from "./pages/activity";
import { Provider } from "./components/provider";

function App() {
        return (
                <Provider>
                        <Switch>
                                <Route path="/" component={Index} />
                                <Route path="/activity" component={ActivityPage} />
                        </Switch>
                </Provider>
        );
}

export default App;
