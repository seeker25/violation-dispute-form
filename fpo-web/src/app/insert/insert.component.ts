import {
  Component,
  ComponentFactoryResolver,
  HostBinding,
  Input,
  OnInit,
  ReflectiveInjector,
  ViewContainerRef,
  ViewChild
} from "@angular/core";
import { InsertService } from "./insert.service";
// each component which will be dynamically inserted must be imported here
import { StaticComponent } from "../static/static.component";

// based on http://blog.rangle.io/dynamically-creating-components-with-angular-2/
@Component({
  selector: "app-insert",
  entryComponents: [StaticComponent],
  template: `
    <div #container></div>
  `
})
export class InsertComponent implements OnInit {
  @ViewChild("container", { read: ViewContainerRef, static: false })
  container: ViewContainerRef;
  currentInsert: any = null;

  @Input() id: string;
  @HostBinding("class.insert-hidden") hidden: boolean = true;

  constructor(
    private resolver: ComponentFactoryResolver,
    private insertService: InsertService
  ) {}

  ngOnInit() {
    if (this.id) {
      // register with global 'insert' service so the active component can update us
      this.insertService.registerInsert(this.id, this);
    }
  }

  @Input() set componentSpec(spec: {
    type: string;
    inputs?: any;
    options?: any;
  }) {
    let compCls = spec;
    if (!compCls) {
      this.hidden = true;
      return;
    }

    // Inputs need to be in the following format to be resolved properly
    let inputProviders = Object.keys(spec.inputs).map(inputName => {
      return { provide: inputName, useValue: spec.inputs[inputName] };
    });
    let resolvedInputs = ReflectiveInjector.resolve(inputProviders);

    // We create an injector out of the data we want to pass down and this components injector
    let injector = ReflectiveInjector.fromResolvedProviders(
      resolvedInputs,
      this.container.parentInjector
    );

    // We create a factory out of the component we want to create
   // let factory = this.resolver.resolveComponentFactory(compCls);

    // We create the component using the factory and the injector
    //let component = factory.create(injector);

    // We insert the component into the dom container
    //this.container.insert(component.hostView);

    // Destroy the previously created component
    if (this.currentInsert) {
      this.currentInsert.destroy();
    }

    //this.currentInsert = component;
    this.hidden = false;
  }
}
