export const ROLES = {
  fonctionnaire: "Fonctionnaire",
  chef_service: "Chef de service",
  administrateur: "Admin",
};

export const COULEURS_ROLE = {
  administrateur: "bg-amber-50 text-amber-700 border border-amber-200",
  chef_service: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  fonctionnaire: "bg-indigo-50 text-indigo-700 border border-indigo-200",
};

export const REDIRECTIONS_ROLE = {
  fonctionnaire: "/fonctionnaire",
  chef_service: "/chef",
  administrateur: "/admin",
};

export const libelleRole = (role) => ROLES[role] || role;
