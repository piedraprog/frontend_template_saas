export class RegexUtils {
  public static readonly OnlyLettersRegx: RegExp = /^[a-zA-Z0-9._]+$/;

  public static readonly UsernameRegx: RegExp = /^[a-zA-Z0-9._-]+$/;

  public static readonly CompanyNameRegx: RegExp =
    /^[a-zA-Z0-9](?:[a-zA-Z0-9 .&'_-]*[a-zA-Z0-9])?$/;

  public static readonly StrongPasswordRegx: RegExp =
    /^(?=[^A-Z]*[A-Z])(?=[^a-z]*[a-z])(?=\D*\d).{8,}$/;
}
