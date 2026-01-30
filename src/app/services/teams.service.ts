import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Team } from '../models/types.model';
import { tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TeamsService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/teams`;

  myTeams = signal<Team[]>([]);
  isLoading = signal<boolean>(false);
  error = signal<string | null>(null);

  loadTeams() {
    this.isLoading.set(true);
    this.http.get<Team[]>(this.apiUrl).subscribe({
      next: (data) => {
        this.myTeams.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.error.set('שגיאה בטעינה');
        this.isLoading.set(false);
      }
    });
  }

  addTeam(name: string) {
    return this.http.post<Team>(this.apiUrl, { name }).pipe(
      tap((newTeam) => {
        this.myTeams.update(currentTeams => [...currentTeams, newTeam]);
      })
    );
  }
  updateTeamMembers(teamId: string, members: any[]) {
    this.myTeams.update(teams => {
      // יוצרים עותק חדש של המערך כדי שאנגולר יזהה שינוי
      return teams.map(team => {
        if (team.id === teamId) {
          return { ...team, members: members }; // מחזיר אובייקט צוות חדש עם החברים
        }
        return team;
      });
    });
  }

  // בתוך TeamsService
  allUsers = signal<any[]>([]); // סיגנל שיחזיק את כל המשתמשים במערכת

  loadAllUsers() {
    // אנחנו פונים ל-api/users ולא ל-api/teams/users
    return this.http.get<any[]>('http://localhost:3000/api/users').subscribe({
      next: (users) => {
        console.log('הצלחנו! רשימת המשתמשים:', users);
        this.allUsers.set(users);
      },
      error: (err) => console.log('עדיין שגיאה?', err)
    });
  }


  addMember(teamId: any, userId: any) {
    // אנחנו שולחים אובייקט עם userId ועם role כפי שמופיע בפוסטמן
    const body = {
      userId: Number(userId), // וודא שזה מספר
      role: 'member'
    };

    return this.http.post(`${this.apiUrl}/${teamId}/members`, body);
  }

  // בתוך teams.service.ts
  //  getTeamMembers(teamId: any) {
  //   // פנייה לנתיב המדויק מהפוסטמן להבאת חברי צוות ספציפי
  //   return this.http.get<any[]>(`${this.apiUrl}/teams/${teamId}/members`);
  // }


  // teams.service.ts
  getTeamMembers(teamId: any) {
    // הסרנו את המילה 'teams' כי היא כבר קיימת ב-apiUrl
    return this.http.get<any[]>(`${this.apiUrl}/${teamId}/members`);
  }

    deleteTeam(teamId: string) {
    return this.http.delete(`${this.apiUrl}/${teamId}`).pipe(
      tap(() => {
        // הסרת הצוות מהסיגנל המקומי כדי שהממשק יתעדכן מיד
        this.myTeams.update(teams => teams.filter(t => t.id !== teamId));
      })
    );
  }
}


// import { Injectable, inject, signal } from '@angular/core';
// import { HttpClient } from '@angular/common/http';
// import { environment } from '../../environments/environment';
// import { Team } from '../models/types.model';
// import { tap } from 'rxjs';

// @Injectable({
//   providedIn: 'root'
// })
// export class TeamsService {
//   private http = inject(HttpClient);
//   private apiUrl = `${environment.apiUrl}/teams`;
//   // נתיב כללי למשתמשים (מחוץ לתיקיית teams)
//   private usersUrl = 'http://localhost:3000/api/users'; 

//   myTeams = signal<Team[]>([]);
//   allUsers = signal<any[]>([]); // סיגנל שיחזיק את כל המשתמשים במערכת ל-Dropdown
//   isLoading = signal<boolean>(false);
//   error = signal<string | null>(null);

//   // 1. טעינת הצוותים של המשתמש המחובר
//   loadTeams() {
//     this.isLoading.set(true);
//     this.http.get<Team[]>(this.apiUrl).subscribe({
//       next: (data) => {
//         this.myTeams.set(data);
//         this.isLoading.set(false);
//       },
//       error: (err) => {
//         this.error.set('שגיאה בטעינת הצוותים');
//         this.isLoading.set(false);
//       }
//     });
//   }

//   // 2. טעינת כל המשתמשים במערכת (להוספה לצוות)
//   loadAllUsers() {
//     return this.http.get<any[]>(this.usersUrl).subscribe({
//       next: (users) => {
//         console.log('רשימת המשתמשים נטענה:', users);
//         this.allUsers.set(users);
//       },
//       error: (err) => console.error('שגיאה בטעינת משתמשים - וודאו שהנתיב נכון', err)
//     });
//   }

//   // 3. יצירת צוות חדש
//   addTeam(name: string) {
//     return this.http.post<Team>(this.apiUrl, { name }).pipe(
//       tap((newTeam) => {
//         this.myTeams.update(currentTeams => [...currentTeams, newTeam]);
//       })
//     );
//   }

//   // 4. מחיקת צוות


//   // 5. הוספת חבר לצוות (עם המרת ID למספר)
//   addMember(teamId: any, userId: any) {
//     const body = {
//       userId: Number(userId), // המרה למספר כפי שהשרת דורש
//       role: 'member'
//     };
//     return this.http.post(`${this.apiUrl}/${teamId}/members`, body);
//   }

//   // 6. קבלת חברים של צוות ספציפי (נתיב מתוקן)
//   getTeamMembers(teamId: any) {
//     return this.http.get<any[]>(`${this.apiUrl}/${teamId}/members`);
//   }

//   // 7. עדכון חברי צוות בתוך ה-Signal (עבור התצוגה)
//   updateTeamMembers(teamId: string, members: any[]) {
//     this.myTeams.update(teams => {
//       // יוצרים עותק חדש של המערך כדי שאנגולר יזהה שינוי
//       return teams.map(team => {
//         if (team.id === teamId) {
//           return { ...team, members: members }; // מחזיר אובייקט צוות חדש עם רשימת החברים המעודכנת
//         }
//         return team;
//       });
//     });
//   }
// }