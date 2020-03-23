import controllers from './register-controllers';
import { ControllerRouteProps } from '@/typings/controller.typing';

/** extract only route props */
function fromControllerToRoute(controllers: any): ControllerRouteProps[] {
  return controllers.map((Controller: any) => {
    const instance: ControllerRouteProps = new Controller();

    // route name and router
    return { route: instance.route, router: instance.router };
  });
}

export default fromControllerToRoute(controllers);
