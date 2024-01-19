# Documentation

## Default Dialog

### Types

#### Testing

Ajouter ceci aux imports:

import { MatDialogModule } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';


Ajouter ceci dans les imports du testbed:

MatDialogModule, BrowserAnimationsModule, RouterTestingModule.withRoutes([])

##### DefaultDialogParameters

| name      | type                              | definition            |
| --------- | --------------------------------- | --------------------- |
| `title`   | `string`                          | Title of the dialog   |
| `content` | `string`                          | Content of the dialog |
| `buttons` | `DefaultDialogButtonParameters[]` | Buttons of the dialog |

##### DefaultDialogButtonParameters

| name          | type                      | definition                                                                 |
| ------------- | ------------------------- | -------------------------------------------------------------------------- |  
| `content`     | `string`                  | Content of the button                                                      |
| `closeDialog` | `boolean \| undefined`    | Close the dialog when button is clicked                                    |
| `action`      | `() => void \| undefined` | Function to execute when clicking on the button                            |
| `redirect`    | `string \| undefined`     | Routing destination when clicking the button (this override `closeDialog`) |
| `style`       | `string \| undefined`     | CSS style on the button                                                    |

### Usage
```typescript
class MyComponent {
    // Inject MatDialog
    constructor(public dialog: MatDialog) {}

    // Call this to open the dialog
    openDialog() {
        this.dialog.open(DefaultDialogComponent, {
            data: { // Data type is DefaultDialogParameters
                title: 'Dialog title',
                content: 'This is the dialog content',
                buttons: [
                    {
                        content: 'Close',
                        closeDialog: true,
                    },
                    {
                        content: 'Ok',
                        redirect: '/game',
                    },
                ],
            },
        });
    }
}
```