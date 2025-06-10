# Project Todos

# Restructure the project
Terminology Update: 'Apostolic Center' and 'HQ' have been standardized to 'Center'. The concept of a separate 'Headquarters' entity has been removed.

app/
/dashboard - Global Admin
/centers


# Restructure the project
We would need to completely seperate client side from server side.
All files are under /lib

 Global admin Dahsboard:
 This is accesses by global admin to manage everything.

All centers (churches) have:
 - Clusters (Home fellowships)
 - Teams (Work force groups eg worship team, technical team)
 - Small groups
 - Members - Members are connected to a center
 - Attendees - Connected to a center or cluster
 - Events
 - Follow-up

Clusters: Clusters can have attendees but members must be connected to the center.


# Attendees
Create a new model for attendees 
- These are people who attend meetings but are not full members yet.
- Attendees may also have levels. There are frequent attendees and one-timers. We would need a way to rank and tag these and give proper names.
- The follow-up system uses both attendees and members for follow-ups
- 

