First do  npx create-next-app@latest ./ --typescript --tailwind --eslint
Then go to shadcn installation doc, select nextjs and it will give the remaining steps.
All the components will be stored in the components folder(automatically created by shadcn). eg You can install a button using the command
npx shadcn@latest add button

Download assets folder from a zip file. Put the contents of the file here
Put global.css in app

Explore tailwind.config.css and see how the author has put his favourite colors there. public folder has all the icons that we need, types has all the necessary types

The constants folder has all the routes. global.css also has the necessary utility classes

Make changes in layout.tsx, create a (root) folder with layout.tsx and page.tsx in it

You will create diff components like header box and total balance box and also work on page.tsx in root. You will also need to install query-string to use formatAmount and also install chart.js followed by npm install react-chartjs-2

For forms we shall install forms from shad cn (check shadcn react hook form)

For accepting data in form, we need server actions, so in lib folder, create a folder called actions and create a new file called user.actions.ts